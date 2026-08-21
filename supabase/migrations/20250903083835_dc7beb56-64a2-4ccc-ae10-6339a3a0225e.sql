-- Check which functions have search_path issues
SELECT 
    p.proname,
    p.prosrc,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname LIKE '%update_updated_at%'
  AND prosecdef = true;