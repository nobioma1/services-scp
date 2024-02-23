# Create S3 for static web hosting
resource "aws_s3_bucket" "s3-static-website-bucket" {
  bucket        = var.bucket_name
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "s3-static-website-bucket" {
  bucket = aws_s3_bucket.s3-static-website-bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "s3-static-website-bucket" {
  bucket = aws_s3_bucket.s3-static-website-bucket.id

  ignore_public_acls      = false
  block_public_policy     = false
  restrict_public_buckets = false
  block_public_acls       = false
}

resource "aws_s3_bucket_ownership_controls" "s3-static-website-bucket" {
  bucket = aws_s3_bucket.s3-static-website-bucket.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# resource "aws_s3_bucket_policy" "bucket_policy" {
#   bucket = aws_s3_bucket.s3-static-website-bucket.id

#   policy = jsonencode({
#     "Version" : "2012-10-17",
#     "Statement" : [
#       {
#         "Sid" : "PublicRead",
#         "Effect" : "Allow",
#         "Principal" : "*",
#         "Action" : ["s3:GetObject"],
#         "Resource" : [
#           "arn:aws:s3:::${var.bucket_name}/*"
#         ]
#       }
#     ]
#     }
#   )
# }

resource "aws_s3_bucket_acl" "s3-static-website-bucket" {
  acl    = "public-read"
  bucket = aws_s3_bucket.s3-static-website-bucket.id

  depends_on = [
    aws_s3_bucket_public_access_block.s3-static-website-bucket,
    aws_s3_bucket_ownership_controls.s3-static-website-bucket
  ]
}
