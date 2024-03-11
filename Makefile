# Define the path to the Terraform directory
TERRAFORM_DIR := infra/tf

ROOT_DIR := $(shell pwd)

SERVICES_LAYER_DIR := packages/lambda_layer

# Helper function to require ENV to be either {dev | prod}
require-env:
ifeq ($(filter $(ENV),dev prod),)
	$(error ENV is not defined or invalid. Please set ENV=[dev|prod])
endif

# initialize terraform
tf-init: require-env
	@cd $(TERRAFORM_DIR) && \
			terraform init -reconfigure

# Create Terraform workspace > make ENV=dev tf-create-workspace
tf-create-workspace: require-env
	@echo "Creating Terraform $(ENV) workspace"
	@cd $(TERRAFORM_DIR) && \
		terraform workspace new $(ENV)

# Select ENV workspace and initialize terraform
tf-validate: require-env
	@cd $(TERRAFORM_DIR) && \
		terraform workspace select $(ENV) && \
			terraform validate

# reuse to run terraform commands > TF_COMMAND=plan|apply|destroy ENV=dev make tf
TF_COMMAND ?= plan
AUTO_APPROVE ?= false
tf: require-env
	@echo "Running Terraform $(TF_COMMAND) command with $(ENV) workspace"
	@cd $(TERRAFORM_DIR) && \
		terraform workspace select $(ENV) && \
		terraform $(TF_COMMAND) $$(if [ "$(TF_COMMAND)" = "apply" ] && [ "$(AUTO_APPROVE)" = "true" ]; then echo "-auto-approve"; fi) \
		$$(if [ -f "config.tfvars" ]; then echo "-var-file=config.tfvars"; fi)

tf-sam-start-api: require-env
	@echo "Starting SAM with Terraform $(ENV) workspace"
	@cd $(TERRAFORM_DIR) && \
		terraform workspace select $(ENV) && \
		sam local start-api -p 8000 --env-vars $(ROOT_DIR)/env.json --hook-name terraform
