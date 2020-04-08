package handler

import (
	"github.com/kapp-staging/kapp/api/client"
	"github.com/labstack/echo/v4"
	"github.com/sirupsen/logrus"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/labels"
)

var (
	ListAll = v1.ListOptions{
		LabelSelector: labels.Everything().String(),
		FieldSelector: fields.Everything().String(),
	}
)

type ApiHandler struct {
	clientManager *client.ClientManager
	logger        *logrus.Logger
}

type H map[string]interface{}

func (h *ApiHandler) Install(e *echo.Echo) {
	e.GET("/ping", handlePing)

	// permission routes
	e.POST("/login", h.handleLogin)
	e.GET("/login/status", h.handleLoginStatus)

	// original resources routes
	gV1 := e.Group("/v1", h.AuthClientMiddleware)
	gV1.GET("/deployments", h.handleGetDeployments)
	gV1.GET("/nodes", h.handleGetNodes)
	gV1.GET("/nodes/metrics", h.handleGetNodeMetrics)
	gV1.GET("/persistentvolumes", h.handleGetPVs)

	// kapp resources
	gV1.GET("/componenttemplates", h.handleGetComponentTemplates)
	gV1.POST("/componenttemplates", h.handleCreateComponentTemplate)
	gV1.PUT("/componenttemplates/:name", h.handleUpdateComponentTemplate)
	gV1.DELETE("/componenttemplates/:name", h.handleDeleteComponentTemplate)

	gV1.GET("/dependencies", h.handleGetDependencies)
	gV1.GET("/dependencies/available", h.handleGetAvailableDependencies)

	gV1.GET("/applications", h.handleGetApplicationsOld)
	gV1.GET("/applications/:namespace", h.handleGetApplicationsOld)
	gV1.POST("/applications/:namespace", h.handleCreateApplication)
	gV1.PUT("/applications/:namespace/:name", h.handleUpdateApplication)
	gV1.DELETE("/applications/:namespace/:name", h.handleDeleteApplication)

	gV1.GET("/clusterroles", h.handleGetClusterRoles)
	gV1.POST("/clusterroles", h.handleCreateClusterRoles)
	gV1.DELETE("/clusterroles/:name", h.handleDeleteSecrets)

	gV1.GET("/clusterrolebindings", h.handleGetClusterRoleBindings)
	gV1.POST("/clusterrolebindings", h.handleCreateClusterRoleBindings)
	gV1.DELETE("/clusterrolebindings/:name", h.handleDeleteClusterRoleBindings)

	gV1.GET("/serviceaccounts", h.handleGetServiceAccounts)
	gV1.POST("/serviceaccounts", h.handleCreateServiceAccounts)
	gV1.DELETE("/serviceaccounts/:name", h.handleDeleteServiceAccounts)

	gV1.GET("/secrets", h.handleGetSecrets)
	gV1.POST("/secrets", h.handleCreateSecrets)
	gV1.GET("/secrets/:name", h.handleGetSecret)
	gV1.DELETE("/secrets/:name", h.handleDeleteSecrets)

	gV1.GET("/namespaces", h.handleGetNamespaces)

	gv1Alpha1 := e.Group("/v1alpha1")
	gv1Alpha1.GET("/logs", h.logWebsocketHandler)
	gv1Alpha1.GET("/exec", h.execWebsocketHandler)

	gv1Alpha1WithAuth := gv1Alpha1.Group("", h.AuthClientMiddleware)
	gv1Alpha1WithAuth.GET("/applications", h.handleGetApplications)
	gv1Alpha1WithAuth.GET("/applications/:namespace", h.handleGetApplications)
	gv1Alpha1WithAuth.GET("/applications/:namespace/:name", h.handleGetApplicationDetails)
	gv1Alpha1WithAuth.PUT("/applications/:namespace/:name", h.handleUpdateApplicationNew)
	gv1Alpha1WithAuth.DELETE("/applications/:namespace/:name", h.handleDeleteApplication)
	gv1Alpha1WithAuth.POST("/applications/:namespace", h.handleCreateApplicationNew)

	gv1Alpha1WithAuth.GET("/componenttemplates", h.handleGetComponentTemplatesNew)
	gv1Alpha1WithAuth.POST("/componenttemplates", h.handleCreateComponentTemplateNew)
	gv1Alpha1WithAuth.PUT("/componenttemplates/:name", h.handleUpdateComponentTemplateNew)
	gv1Alpha1WithAuth.DELETE("/componenttemplates/:name", h.handleDeleteComponentTemplateNew)

	gv1Alpha1WithAuth.GET("/files/:namespace", h.handleListFiles)
	gv1Alpha1WithAuth.POST("/files/:namespace", h.handleCreateFile)
	gv1Alpha1WithAuth.PUT("/files/:namespace", h.handleUpdateFile)
	gv1Alpha1WithAuth.PUT("/files/:namespace/move", h.handleMoveFile)
	gv1Alpha1WithAuth.DELETE("/files/:namespace", h.handleDeleteFile)

	gv1Alpha1WithAuth.GET("/nodes/metrics", h.handleGetNodeMetricsNew)

	gv1Alpha1WithAuth.DELETE("/pods/:namespace/:name", h.handleDeletePod)

	gv1Alpha1WithAuth.GET("/namespaces", h.handleListNamespaces)
	gv1Alpha1WithAuth.POST("/namespaces/:name", h.handleCreateNamespace)
	gv1Alpha1WithAuth.DELETE("/namespaces/:name", h.handleDeleteNamespace)

	gv1Alpha1WithAuth.GET("/rolebindings", h.handleListRoleBindings)
	gv1Alpha1WithAuth.POST("/rolebindings", h.handleCreateRoleBinding)
	gv1Alpha1WithAuth.DELETE("/rolebindings/:namespace/:name", h.handleDeleteRoleBinding)

	gv1Alpha1WithAuth.GET("/serviceaccounts/:name", h.handleGetServiceAccount)
}

func NewApiHandler(clientManager *client.ClientManager) *ApiHandler {
	return &ApiHandler{
		clientManager: clientManager,
		logger:        logrus.New(),
	}
}
