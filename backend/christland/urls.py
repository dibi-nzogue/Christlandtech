# christland/urls.py
from django.urls import path

from .views import ( CategoryProductList, CategoryFilters, CategoryListView,ProductMiniView, BlogHeroView, BlogPostsView, LatestProductsView, ContactMessageView, ProduitsListCreateView, ProduitsDetailView, AddProductWithVariantView, MarquesListView, CouleursListView, UploadProductImageView, DashboardProductEditDataView, ProductClickView, 
                    MostDemandedProductsView,DashboardArticlesListCreateView, DashboardArticleDetailView, DashboardArticleEditView,DashboardArticlesListCreateView, BlogLatestView,AdminGlobalSearchView,  DashboardStatsView,)


app_name = "christland"

urlpatterns = [
    path("api/catalog/marques/", MarquesListView.as_view(), name="catalog_marques"),
    path("api/catalog/couleurs/", CouleursListView.as_view(), name="catalog_couleurs"),
    path("api/catalog/categories/", CategoryListView.as_view(), name="catalog-categories"),
    path("api/catalog/products/",   CategoryProductList.as_view(), name="catalog-products"),
    path("api/catalog/filters/",    CategoryFilters.as_view(),     name="catalog-filters"),
    path("api/catalog/product/<str:pk_or_slug>/mini/", ProductMiniView.as_view()),
    path("api/blog/hero/", BlogHeroView.as_view(), name="api_blog_hero"),
    path("api/blog/posts/", BlogPostsView.as_view(), name="api_blog_posts"),
    path("api/catalog/products/<int:pk>/click/", ProductClickView.as_view()),
    path("api/catalog/products/most-demanded/", MostDemandedProductsView.as_view()),
    # ADMINISTRATEUR
    path("api/dashboard/produits/", ProduitsListCreateView.as_view(), name="dashboard-produits-list-create"),
    path("api/dashboard/produits/<int:pk>/", ProduitsDetailView.as_view(), name="dashboard-produits-detail"),
    path("api/catalog/products/latest/", LatestProductsView.as_view(), name="latest-products"),
    path("api/contact/messages/", ContactMessageView.as_view(), name="contact-messages"),
    path("api/produits/ajouter/", AddProductWithVariantView.as_view(), name="add_product_with_variant"),
    path("api/uploads/images/", UploadProductImageView.as_view(), name="upload-product-image"),
    path("api/dashboard/produits/<int:pk>/edit/", DashboardProductEditDataView.as_view(), name="dashboard-produits-edit"),
    path("api/dashboard/articles/", DashboardArticlesListCreateView.as_view(), name="dashboard-articles"),
    path("api/dashboard/articles/<int:pk>/", DashboardArticleDetailView.as_view(), name="dashboard-article-detail"),
    path("api/dashboard/articles/<int:pk>/edit/", DashboardArticleEditView.as_view(), name="dashboard-article-edit"),
    path("api/dashboard/articles/", DashboardArticlesListCreateView.as_view()),
    path("api/blog/latest/", BlogLatestView.as_view()),
    path("api/dashboard/search/", AdminGlobalSearchView.as_view(), name="admin-global-search"),
    path("api/dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),

]
