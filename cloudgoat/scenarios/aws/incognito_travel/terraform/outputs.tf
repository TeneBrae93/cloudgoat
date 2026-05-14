output "cloudgoat_output_website_url" {
  value = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}