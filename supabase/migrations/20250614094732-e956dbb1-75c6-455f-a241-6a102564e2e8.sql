
CREATE OR REPLACE FUNCTION public.get_community_posts_with_details(
    p_user_id UUID,
    p_active_tab TEXT,
    p_search_term TEXT,
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0
)
RETURNS JSONB[] -- Return an array of JSONB objects, each representing a PostData
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, extensions
AS $$
DECLARE
    result JSONB[];
    post_query TEXT;
    order_clause TEXT;
    where_clauses TEXT[] := ARRAY['p.published = true'];
BEGIN
    -- Determine order clause based on active tab
    IF p_active_tab = 'latest' THEN
        order_clause := 'p.created_at DESC';
    ELSIF p_active_tab = 'popular' THEN
        order_clause := 'p.score DESC, p.created_at DESC';
    ELSIF p_active_tab = 'oldest' THEN
        order_clause := 'p.created_at ASC';
    ELSIF p_active_tab = 'my' AND p_user_id IS NOT NULL THEN
        where_clauses := array_append(where_clauses, 'p.user_id = $1'); -- $1 will be p_user_id
        order_clause := 'p.created_at DESC';
    ELSE
        order_clause := 'p.created_at DESC'; -- Default to latest
    END IF;

    -- Add search term filter if provided
    IF p_search_term IS NOT NULL AND p_search_term <> '' THEN
        -- Ensure search term is properly escaped for ILIKE
        where_clauses := array_append(where_clauses, 'p.title ILIKE $2'); -- $2 will be p_search_term_like
    END IF;
    
    post_query := '
        WITH post_base AS (
            SELECT *
            FROM posts p
            WHERE ' || array_to_string(where_clauses, ' AND ') || '
            ORDER BY ' || order_clause || '
            LIMIT $3 OFFSET $4
        )
        SELECT array_agg(
            jsonb_build_object(
                ''id'', pb.id,
                ''title'', pb.title,
                ''content'', pb.content,
                ''image_url'', pb.image_url,
                ''video_url'', pb.video_url,
                ''created_at'', pb.created_at,
                ''updated_at'', pb.updated_at,
                ''user_id'', pb.user_id,
                ''published'', pb.published,
                ''score'', pb.score,
                ''poll_id'', pb.poll_id,
                ''pinned'', pb.pinned,
                ''pinned_at'', pb.pinned_at,
                ''pinned_by'', pb.pinned_by,
                ''issue_id'', pb.issue_id,
                ''auto_generated'', pb.auto_generated,
                ''pin_duration_days'', pb.pin_duration_days,
                ''profiles'', (
                    SELECT jsonb_build_object(
                        ''full_name'', pr.full_name,
                        ''avatar_url'', pr.avatar_url
                    )
                    FROM profiles pr WHERE pr.id = pb.user_id
                ),
                ''post_flairs'', (
                    SELECT jsonb_build_object(
                        ''id'', pf.id,
                        ''name'', pf.name,
                        ''color'', pf.color
                    )
                    FROM post_flairs pf WHERE pf.id = pb.flair_id
                ),
                ''userVote'', (
                    SELECT pv.value
                    FROM post_votes pv
                    WHERE pv.post_id = pb.id AND pv.user_id = $1 -- p_user_id
                ),
                ''poll'', CASE
                    WHEN pb.poll_id IS NOT NULL THEN (
                        SELECT jsonb_build_object(
                            ''id'', pp.id,
                            ''options'', (
                                SELECT jsonb_agg(
                                    jsonb_build_object(
                                        ''id'', po.id,
                                        ''text'', po.text,
                                        ''position'', po.position,
                                        ''votes'', (SELECT COUNT(*) FROM poll_votes pv_opt WHERE pv_opt.option_id = po.id)
                                    ) ORDER BY po.position
                                )
                                FROM poll_options po WHERE po.poll_id = pp.id
                            ),
                            ''total_votes'', (
                                SELECT COUNT(*)
                                FROM poll_votes pv_total
                                JOIN poll_options po_total ON pv_total.option_id = po_total.id
                                WHERE po_total.poll_id = pp.id
                            ),
                            ''user_vote'', (
                                SELECT pov.option_id
                                FROM poll_votes pov
                                JOIN poll_options poo ON pov.option_id = poo.id
                                WHERE poo.poll_id = pp.id AND pov.user_id = $1 -- p_user_id
                                LIMIT 1
                            )
                        )
                        FROM post_polls pp WHERE pp.id = pb.poll_id
                    )
                    ELSE NULL
                END
            )
        )
        FROM post_base pb';

    -- Prepare arguments for EXECUTE based on whether p_search_term is used
    IF p_search_term IS NOT NULL AND p_search_term <> '' THEN
        EXECUTE post_query INTO result USING p_user_id, '%' || p_search_term || '%', p_limit, p_offset;
    ELSE
        -- Construct a query string that doesn't reference $2 if search term is not used
        -- This is a bit tricky as EXECUTE USING requires all placeholders to be filled.
        -- A simpler way is to pass NULL or an empty string for $2 and let the SQL logic handle it.
        -- However, the current query construction assumes $2 will be the search term.
        -- Re-construct query without $2 placeholder if search_term is empty.
        IF array_length(where_clauses, 1) > 0 THEN -- Check if there are any where clauses
            post_query := '
                WITH post_base AS (
                    SELECT *
                    FROM posts p
                    WHERE ' || array_to_string(where_clauses, ' AND ') || '
                    ORDER BY ' || order_clause || '
                    LIMIT $2 OFFSET $3 -- $1=p_user_id, $2=p_limit, $3=p_offset
                )
                SELECT array_agg(
                    jsonb_build_object(
                        ''id'', pb.id,
                        ''title'', pb.title,
                        ''content'', pb.content,
                        ''image_url'', pb.image_url,
                        ''video_url'', pb.video_url,
                        ''created_at'', pb.created_at,
                        ''updated_at'', pb.updated_at,
                        ''user_id'', pb.user_id,
                        ''published'', pb.published,
                        ''score'', pb.score,
                        ''poll_id'', pb.poll_id,
                        ''pinned'', pb.pinned,
                        ''pinned_at'', pb.pinned_at,
                        ''pinned_by'', pb.pinned_by,
                        ''issue_id'', pb.issue_id,
                        ''auto_generated'', pb.auto_generated,
                        ''pin_duration_days'', pb.pin_duration_days,
                        ''profiles'', (
                            SELECT jsonb_build_object(
                                ''full_name'', pr.full_name,
                                ''avatar_url'', pr.avatar_url
                            )
                            FROM profiles pr WHERE pr.id = pb.user_id
                        ),
                        ''post_flairs'', (
                            SELECT jsonb_build_object(
                                ''id'', pf.id,
                                ''name'', pf.name,
                                ''color'', pf.color
                            )
                            FROM post_flairs pf WHERE pf.id = pb.flair_id
                        ),
                        ''userVote'', (
                            SELECT pv.value
                            FROM post_votes pv
                            WHERE pv.post_id = pb.id AND pv.user_id = $1 -- p_user_id
                        ),
                        ''poll'', CASE
                            WHEN pb.poll_id IS NOT NULL THEN (
                                SELECT jsonb_build_object(
                                    ''id'', pp.id,
                                    ''options'', (
                                        SELECT jsonb_agg(
                                            jsonb_build_object(
                                                ''id'', po.id,
                                                ''text'', po.text,
                                                ''position'', po.position,
                                                ''votes'', (SELECT COUNT(*) FROM poll_votes pv_opt WHERE pv_opt.option_id = po.id)
                                            ) ORDER BY po.position
                                        )
                                        FROM poll_options po WHERE po.poll_id = pp.id
                                    ),
                                    ''total_votes'', (
                                        SELECT COUNT(*)
                                        FROM poll_votes pv_total
                                        JOIN poll_options po_total ON pv_total.option_id = po_total.id
                                        WHERE po_total.poll_id = pp.id
                                    ),
                                    ''user_vote'', (
                                        SELECT pov.option_id
                                        FROM poll_votes pov
                                        JOIN poll_options poo ON pov.option_id = poo.id
                                        WHERE poo.poll_id = pp.id AND pov.user_id = $1 -- p_user_id
                                        LIMIT 1
                                    )
                                )
                                FROM post_polls pp WHERE pp.id = pb.poll_id
                            )
                            ELSE NULL
                        END
                    )
                )
                FROM post_base pb';
            EXECUTE post_query INTO result USING p_user_id, p_limit, p_offset;
        ELSE -- Should not happen with p.published = true, but as a fallback
             post_query := '
                WITH post_base AS (
                    SELECT *
                    FROM posts p
                    ORDER BY ' || order_clause || '
                    LIMIT $2 OFFSET $3 -- $1=p_user_id, $2=p_limit, $3=p_offset
                )
                SELECT array_agg(
                    jsonb_build_object(
                       ''id'', pb.id,
                        ''title'', pb.title,
                        ''content'', pb.content,
                        ''image_url'', pb.image_url,
                        ''video_url'', pb.video_url,
                        ''created_at'', pb.created_at,
                        ''updated_at'', pb.updated_at,
                        ''user_id'', pb.user_id,
                        ''published'', pb.published,
                        ''score'', pb.score,
                        ''poll_id'', pb.poll_id,
                        ''pinned'', pb.pinned,
                        ''pinned_at'', pb.pinned_at,
                        ''pinned_by'', pb.pinned_by,
                        ''issue_id'', pb.issue_id,
                        ''auto_generated'', pb.auto_generated,
                        ''pin_duration_days'', pb.pin_duration_days,
                        ''profiles'', (
                            SELECT jsonb_build_object(
                                ''full_name'', pr.full_name,
                                ''avatar_url'', pr.avatar_url
                            )
                            FROM profiles pr WHERE pr.id = pb.user_id
                        ),
                        ''post_flairs'', (
                            SELECT jsonb_build_object(
                                ''id'', pf.id,
                                ''name'', pf.name,
                                ''color'', pf.color
                            )
                            FROM post_flairs pf WHERE pf.id = pb.flair_id
                        ),
                        ''userVote'', (
                            SELECT pv.value
                            FROM post_votes pv
                            WHERE pv.post_id = pb.id AND pv.user_id = $1 -- p_user_id
                        ),
                        ''poll'', CASE
                            WHEN pb.poll_id IS NOT NULL THEN (
                                SELECT jsonb_build_object(
                                    ''id'', pp.id,
                                    ''options'', (
                                        SELECT jsonb_agg(
                                            jsonb_build_object(
                                                ''id'', po.id,
                                                ''text'', po.text,
                                                ''position'', po.position,
                                                ''votes'', (SELECT COUNT(*) FROM poll_votes pv_opt WHERE pv_opt.option_id = po.id)
                                            ) ORDER BY po.position
                                        )
                                        FROM poll_options po WHERE po.poll_id = pp.id
                                    ),
                                    ''total_votes'', (
                                        SELECT COUNT(*)
                                        FROM poll_votes pv_total
                                        JOIN poll_options po_total ON pv_total.option_id = po_total.id
                                        WHERE po_total.poll_id = pp.id
                                    ),
                                    ''user_vote'', (
                                        SELECT pov.option_id
                                        FROM poll_votes pov
                                        JOIN poll_options poo ON pov.option_id = poo.id
                                        WHERE poo.poll_id = pp.id AND pov.user_id = $1 -- p_user_id
                                        LIMIT 1
                                    )
                                )
                                FROM post_polls pp WHERE pp.id = pb.poll_id
                            )
                            ELSE NULL
                        END
                    )
                )
                FROM post_base pb';
            EXECUTE post_query INTO result USING p_user_id, p_limit, p_offset;
        END IF;
    END IF;
    
    RETURN COALESCE(result, '{}'::JSONB[]); -- Return empty array if no posts
END;
$$;
