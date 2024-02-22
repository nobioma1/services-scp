# Define the path to the Terraform directory
TERRAFORM_DIR := infra/tf

# Helper function to require ENV to be either {dev | prod}
require-env:
ifeq ($(filter $(ENV),dev prod),)
	$(error ENV is not defined or invalid. Please set ENV=[dev|prod])
endif

# Create Terraform workspace > make ENV=dev tf-create-workspace
tf-create-workspace: require-env
	@echo "Creating Terraform $(ENV) workspace"
	@cd $(TERRAFORM_DIR) && \
		terraform workspace new $(ENV)

# reuse to run terraform commands > TF_COMMAND=plan|apply|destroy ENV=dev make tf
TF_COMMAND ?= plan
AUTO_APPROVE ?= false
tf: require-env
	@echo "Running Terraform $(TF_COMMAND) command with $(ENV) workspace"
	@cd $(TERRAFORM_DIR) && \
		terraform workspace select $(ENV) && \
		terraform $(TF_COMMAND) $$(if [ "$(TF_COMMAND)" = "apply" ] && [ "$(AUTO_APPROVE)" = "true" ]; then echo "-auto-approve"; fi) \
		$$(if [ -f "config.tfvars" ]; then echo "-var-file=config.tfvars"; fi)


