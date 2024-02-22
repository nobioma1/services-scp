output "feedbacks_queue_url" {
  description = "Feedbacks Queue URL for URL "
  value       = aws_sqs_queue.feedback_ratings_queue.url
}
