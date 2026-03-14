variable "subscription_id" {
  description = "Your Azure subscription ID"
  type        = string
}
variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string
  default     = "chatbot-rg"
}

variable "location" {
  description = "Azure region to deploy resources"
  type        = string
  default     = "East US"
}

variable "acr_name" {
  description = "Name of Azure Container Registry (must be globally unique, lowercase, no hyphens)"
  type        = string
  default     = "rohithacr2026"
}

variable "aks_name" {
  description = "Name of the AKS cluster"
  type        = string
  default     = "chatbot-aks"
}