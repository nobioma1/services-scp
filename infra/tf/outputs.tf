output "frontend_url" {
  description = "Frontend URL"
  value       = module.s3_static_website.static_website_url
}

output "events_url" {
  description = "Events service URL"
  value       = module.aws-events-elasticbeanstalk.eb_environment_domain
}

output "tickets_url" {
  description = "Tickets service URL"
  value       = module.aws-tickets-elasticbeanstalk.eb_environment_domain
}

output "feedbacks_queue_url" {
  description = "Feedbacks Queue URL"
  value       = aws_sqs_queue.feedback_ratings_queue.url
}

output "feedbacks_url" {
  description = "Feedbacks service URL"
  value       = module.aws-feedbacks-elasticbeanstalk.eb_environment_domain
}

