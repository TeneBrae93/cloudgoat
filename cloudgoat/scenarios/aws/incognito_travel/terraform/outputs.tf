output "Starting_Website" {
  value = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}