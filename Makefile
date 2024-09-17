# Include .env.local file if it exists. 
-include .env.local

# Include .env file if it exists
-include .env
#
# NOTE: Order (for the 2 lines above) is important for CI/CD git flow. 
# What is happening here, we first set all the variables with the .env.local file, and then with the .env file
# Since the .env file will NOT exist on github, it will take all the values in the .env.local, which are set 
# during the CI/CD with the environment variables.
#

# Define variables
# .env imported variables
PORT := $(if $(PORT),$(PORT),8080)
DOCKER_INTERNAL_PORT := $(if $(DOCKER_INTERNAL_PORT),$(DOCKER_INTERNAL_PORT),8080)
# Get the current directory name and convert it to lowercase
DOCKER_NAME_BASE := $(if $(MAKEFILE_OVERWRITE_DOCKERNAME),$(MAKEFILE_OVERWRITE_DOCKERNAME),$(shell basename $(CURDIR) | tr '[:upper:]' '[:lower:]'))

# Check if we are inside a Git repository
GIT_REPO = $(shell git rev-parse --is-inside-work-tree 2>/dev/null)

# Set BRANCH_NAME only if inside a Git repository, else set it to an empty string
ifeq ($(GIT_REPO),true)
  BRANCH_NAME = _$(shell git rev-parse --abbrev-ref HEAD)
else
  BRANCH_NAME = ""
endif

# Append the branch name to the directory name
DOCKER_NAME = $(DOCKER_NAME_BASE)$(BRANCH_NAME)
# Append the branch name to the directory name
DOCKER_IMAGE = $(DOCKER_NAME)_image
DOCKER_PATH = ./utils/dockerfiles/
IMAGE_ID := $(shell docker images --filter "label=com.docker.compose.project=$(DOCKER_IMAGE)" --format "{{.ID}}" | head -n 1)
#
# ================
# Default target
##@ Docker
.PHONY: run_container
run_container: ##Run the Docker container with specified port.
	#alternative command:
	#docker run --name $(DOCKER_IMAGE) -d -p $(PORT):8080 $(shell make print_image_id_raw)
	#docker run --name $(DOCKER_NAME) -d -p $(PORT):8080 $(DOCKER_IMAGE):latest
	@docker run --restart unless-stopped --name $(DOCKER_NAME) -d \
			-p $(PORT):8080 \
			$(DOCKER_IMAGE):latest
	@echo "Docker container $(DOCKER_IMAGE) is running on port $(PORT)."

.PHONY: vrun_container
vrun_container: ##Run the Docker container with specified port.
	@docker run --name $(DOCKER_NAME) \
			-p $(PORT):8080 \
			$(DOCKER_IMAGE):latest
	@echo "Docker container $(DOCKER_IMAGE) is running on port $(PORT)."


.PHONY: stop
stop: ##Stops the current running container.
	@docker stop $(DOCKER_NAME)
	@docker rm $(DOCKER_NAME)
	@echo "Docker container $(DOCKER_NAME) is stopped and removed."

.PHONY: clean
clean: ##Remove the Docker image.
	@docker rmi $(DOCKER_IMAGE)
	@echo "Docker image $(DOCKER_IMAGE) is removed."

# View the container's logs
.PHONY: logs
logs: ##Show the logs message.
	@echo "Docker image $(DOCKER_NAME) logs:"
	@docker logs ${DOCKER_NAME}

.PHONY: watch_logs
watch_logs: ##Live log messages.
	@echo "Docker image $(DOCKER_NAME) logs:"
	@docker logs -f $(DOCKER_NAME)

.PHONE: stats
stats: ##Monitor the docker stats.
	@docker stats

.PHONY: prune
prune: ##Safe docker prune. Clean up space.
	@docker system prune

.PHONY: unsafe_prune
unsafe_prune: ##Forced docker prune without safety prompt. Cleans up more space.
	@docker system prune -af

## ===================
##@ Custom Docker Commands
.PHONY: get_repository_name
get_repository_name: ##Gets the repository name IF the print_image_id exists.
	@docker images --format '{{.ID}} {{.Repository}}' | grep -w "$(IMAGE_ID)" | awk '{printf "%s", $$2}'

.PHONY: composebuild-prod
composebuild-prod: ##Docker compose build. No cache by default.
	#docker compose -p $(DOCKER_IMAGE) -f $(DOCKER_PATH)docker-compose.prod.yml build --no-cache 
	export DOCKER_IMAGE_NAME=$(DOCKER_IMAGE) && \
	docker compose -p $(DOCKER_IMAGE) -f $(DOCKER_PATH)docker-compose.yml build 

.PHONY: print_image_id_raw
print_image_id_raw: ##Update the latests image ID.
	@echo -n "$(IMAGE_ID)"

.PHONY: print_image_id
print_image_id: ##Update the latests image ID.
	@echo "Image ID: $(IMAGE_ID)"

.PHONY: stop_matching_containers
stop_matching_containers: ## Stop all running containers with the DOCKER_IMAGE name.
	@echo "Stopping all containers with label com.docker.compose.project=$(DOCKER_IMAGE)"
	@docker ps --filter "label=com.docker.compose.project=$(DOCKER_IMAGE)" --format "{{.ID}}" | xargs -I {} sh -c 'echo "Stopping container: {}" && docker stop {} && docker rm -v {}'
	@echo "Stopping complete"

.PHONY: delete_matching_images
delete_matching_images: ## Delete all local images with the DOCKER_IMAGE name.
	@echo "Deleting images with label com.docker.compose.project=$(DOCKER_IMAGE)"
	@docker images --filter "label=com.docker.compose.project=$(DOCKER_IMAGE)" --format "{{.ID}}" | xargs -I {} sh -c 'echo "Deleting image: {}" && docker rmi {}'
	@echo "Deletion complete"

.PHONY: save_image_as_tar
save_image_as_tar: ## Save the Docker image as a zip file
	@echo "Saving Docker image $(DOCKER_IMAGE) with ID $(IMAGE_ID) as a tar file..."
	# Short version, without writing to disk 
	docker save $(shell make get_repository_name):latest | pigz > $(DOCKER_IMAGE).tar.gz
	
	#Long version, with writing to disk
	#docker save -o $(DOCKER_IMAGE).tar $(shell make get_repository_name):latest
	#pigz $(DOCKER_IMAGE).tar

	@echo "Docker image saved as $(DOCKER_IMAGE).tar.gz"


.PHONY: echo_docker_image_name
echo_docker_image_name: ## Prints the image name.
	@echo -n $(DOCKER_IMAGE)

.PHONY: echo_foldername
echo_foldername: ## Prints the foldername.
	@echo -n $(DOCKER_NAME)

## ===================
##@ Docker Compose

.PHONY: composeupbuild-prod
composeupbuild-prod: ##Docker compose build, by default.
	docker compose -p $(DOCKER_IMAGE) -f $(DOCKER_PATH)docker-compose.prod.yml up --build -d

.PHONY: composeup-prod
composeup-prod: ##Docker compose up, in a detached state.
	docker compose -p $(DOCKER_IMAGE) -f $(DOCKER_PATH)docker-compose.prod.yml up -d

.PHONY: composedown
composedown:	##Docker compose down.
	@docker compose -p $(DOCKER_IMAGE) down

.PHONY: composerm
composerm:	##Docker compose rm.
	@docker compose -p $(DOCKER_IMAGE) rm


# ================
##@ .ENV section 
.PHONY: setupprodenv
setupprodenv: ##A simple command that copies .env.prod the .env file.
	@echo "Copying ./utils/env/.env.prod to root, and dockerfiles."
	@cp ./utils/env/.env.prod .env
	@cp ./utils/env/.env.prod $(DOCKER_PATH).env

.PHONY: setupdevenv
setupdevenv: ##A simple command that copies .env.dev the .env file.
	@echo "Copying ./utils/env/.env.dev to root, and dockerfiles."
	@cp ./utils/env/.env.dev .env
	@cp ./utils/env/.env.dev $(DOCKER_PATH).env

# ================
##@ Label section
.PHONY: help
help:  ##Show this help message.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m\033[0m\n"} /^[a-zA-Z0-9_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

.PHONY: version
version: ##Show version of `Docker`, `Docker compose`. 
	@ docker -v
	@ docker compose version

.PHONY: systemstats
systemstats: ##Show Diskspace, CPU and RAM.
	@echo "Disk Usage: "
	@df | awk 'NR>1 {size+=$$2; used+=$$3; avail+=$$4} \
		END {cmd_size="echo " size " | numfmt --to=iec --from-unit=1000"; \
		cmd_used="echo " used " | numfmt --to=iec --from-unit=1000"; \
		cmd_avail="echo " avail " | numfmt --to=iec --from-unit=1000"; \
		cmd_size | getline formattedSize; close(cmd_size); \
  	cmd_used | getline formattedUsed; close(cmd_used); \
    cmd_avail | getline formattedAvail; close(cmd_avail); \
    printf "%8s%8s%8s%8s\n", "Size", "Used", "Avail.", "Use%"; \
    printf "%8s%8s%8s%8.2f%%\n", formattedSize, formattedUsed, formattedAvail, (used / size) * 100}'
	@echo "=================================="
	@echo ""
	@echo "Memory: "
	@free -h
	@echo "=================================="
	@echo ""
	@lscpu | grep -v -E "On-line CPU\(s\) list:|NUMA node0 CPU\(s\):" | grep -E "CPU\(s\)|Thread\(s\) per core|Model name|CPU.*MHz|BogoMIPS"

.PHONY: diskspace
diskspace: ##Show detailed disk space information.
	@df -h

