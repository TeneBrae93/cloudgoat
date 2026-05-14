provider "aws" {
  region = var.region
}

variable "region" {
  default = "us-east-1"
}

variable "profile" {
  description = "The AWS profile to use"
}

variable "cgid" {
  description = "CloudGoat ID for resources"
}
