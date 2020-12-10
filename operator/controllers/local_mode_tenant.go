package controllers

import (
	"github.com/kalmhq/kalm/controller/api/v1alpha1"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

const DefaultTenantNameForLocalMode = "global"

func (r *KalmOperatorConfigReconciler) reconcileDefaultTenantForLocalMode() error {
	expectedTenant := v1alpha1.Tenant{
		ObjectMeta: metav1.ObjectMeta{
			Name: DefaultTenantNameForLocalMode,
		},
		Spec: v1alpha1.TenantSpec{
			TenantDisplayName: "auto-tenant-for-local-mode",
			ResourceQuota: map[v1alpha1.ResourceName]resource.Quantity{
				v1alpha1.ResourceCPU:                   resource.MustParse("9999"),
				v1alpha1.ResourceMemory:                resource.MustParse("9999Gi"),
				v1alpha1.ResourceHttpRoutesCount:       resource.MustParse("9999"),
				v1alpha1.ResourceHttpsCertsCount:       resource.MustParse("9999"),
				v1alpha1.ResourceDockerRegistriesCount: resource.MustParse("9999"),
				v1alpha1.ResourceApplicationsCount:     resource.MustParse("9999"),
				v1alpha1.ResourceServicesCount:         resource.MustParse("9999"),
				v1alpha1.ResourceComponentsCount:       resource.MustParse("9999"),
				v1alpha1.ResourceAccessTokensCount:     resource.MustParse("9999"),
				v1alpha1.ResourceStorage:               resource.MustParse("9999Gi"),
				v1alpha1.ResourceEphemeralStorage:      resource.MustParse("9999Gi"),
			},
			Owners: []string{"kalm-operator"},
		},
	}

	var tenant v1alpha1.Tenant
	isNew := false

	if err := r.Get(r.Ctx, client.ObjectKey{Name: DefaultTenantNameForLocalMode}, &tenant); err != nil {
		if errors.IsNotFound(err) {
			isNew = true
		} else {
			return nil
		}
	}

	var err error
	if isNew {
		tenant = expectedTenant
		err = r.Create(r.Ctx, &expectedTenant)
	} else {
		tenant.Spec = expectedTenant.Spec
		err = r.Update(r.Ctx, &tenant)
	}

	return err
}
