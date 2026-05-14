resource "aws_cognito_user_pool" "pool" {
  name = "incognito-travel-pool-${var.cgid}"

  # FIX: Using email as username attribute instead of alias
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  schema {
    attribute_data_type      = "String"
    name                     = "email"
    required                 = true
    mutable                  = true

    string_attribute_constraints {
      min_length = 5
      max_length = 2048
    }
  }

  password_policy {
    minimum_length    = 8
    require_lowercase = false
    require_numbers   = false
    require_symbols   = false
    require_uppercase = false
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
  }

  user_attribute_update_settings {
    attributes_require_verification_before_update = []
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name         = "travel-portal-client"
  user_pool_id = aws_cognito_user_pool.pool.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH"
  ]

  write_attributes = ["email", "name"]
  read_attributes  = ["email", "name"]
}

resource "aws_cognito_user" "cory" {
  user_pool_id = aws_cognito_user_pool.pool.id
  # Now that email is a username attribute, this is allowed
  username     = "cory@hacksmarter.hsm"
  attributes = {
    email          = "cory@hacksmarter.hsm"
    email_verified = true
  }
  password = "Password123!"
}
