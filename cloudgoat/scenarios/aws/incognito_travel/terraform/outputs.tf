output "cloudgoat_output_website_url" {
  value = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}

output "cloudgoat_output_attacker_access_key_id" {
  value = aws_iam_access_key.attacker_key.id
}

output "cloudgoat_output_attacker_secret_access_key" {
  value     = aws_iam_access_key.attacker_key.secret
  sensitive = true
}

output "cloudgoat_output_cognito_user_pool_id" {
  value = aws_cognito_user_pool.pool.id
}

output "cloudgoat_output_cognito_client_id" {
  value = aws_cognito_user_pool_client.client.id
}

output "cloudgoat_output_api_url" {
  value = aws_apigatewayv2_api.api.api_endpoint
}
