output "eb_environment_domain" {
  value = aws_elastic_beanstalk_environment.eb_application_env.cname
  description = "The domain name of the Elastic Beanstalk environment."
}