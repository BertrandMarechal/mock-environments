INSERT INTO mgtt_setting_set (set_name, set_value)
SELECT 'database extension', 'database' UNION ALL
SELECT 'middle tier extension', 'middle-tier';

INSERT INTO mgtt_setting_set (set_name, set_value,fk_env_set_environment_id)
SELECT 'root password', 'route', pk_env_id
FROM mgtt_environment_env;