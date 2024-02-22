provider "aws" {
  region = var.aws_default_region

  default_tags {
    tags = {
      Environment = terraform.workspace
    }
  }
}

provider "doppler" {
  doppler_token = var.doppler_token
}