output "Starting_Website" {
  value = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}

output "cloudgoat_output_api_url" {
  value = aws_apigatewayv2_api.api.api_endpoint
}