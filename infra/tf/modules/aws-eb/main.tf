resource "aws_elastic_beanstalk_application" "eb_application" {
  name = var.eb_application_name
}

resource "aws_elastic_beanstalk_environment" "eb_application_env" {
  application         = aws_elastic_beanstalk_application.eb_application.name
  name                = var.eb_env_name
  tier                = "WebServer"
  solution_stack_name = "64bit Amazon Linux 2023 v6.0.3 running Node.js 18"

  setting {
    name      = "EnvironmentType"
    namespace = "aws:elasticbeanstalk:environment"
    value     = "SingleInstance"
  }

  setting {
    name      = "IamInstanceProfile"
    namespace = "aws:autoscaling:launchconfiguration"
    value     = var.eb_env_instance_profile
  }

  dynamic "setting" {
    for_each = var.environment_variables

    content {
      namespace = "aws:elasticbeanstalk:application:environment"
      name      = setting.value["name"]
      value     = setting.value["value"]
    }
  }
}