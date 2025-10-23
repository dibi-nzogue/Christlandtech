# christland/urls.py
from django.urls import path
from .views import CategoryProductList, CategoryFilters, CategoryListView,ProductMiniView, BlogHeroView, BlogPostsView, ProduitsListCreateView, ProduitsDetailView

app_name = "christland"

urlpatterns = [
    path("api/catalog/categories/", CategoryListView.as_view(), name="catalog-categories"),
    path("api/catalog/products/",   CategoryProductList.as_view(), name="catalog-products"),
    path("api/catalog/filters/",    CategoryFilters.as_view(),     name="catalog-filters"),
    path("christland/api/catalog/product/<str:pk_or_slug>/mini/", ProductMiniView.as_view()),
    path("api/blog/hero/", BlogHeroView.as_view(), name="api_blog_hero"),
    path("api/blog/posts/", BlogPostsView.as_view(), name="api_blog_posts"),

    # ADMINISTRATEUR
    path("api/dashboard/produits/", ProduitsListCreateView.as_view(), name="dashboard-produits-list-create"),
    path("api/dashboard/produits/<int:pk>/", ProduitsDetailView.as_view(), name="dashboard-produits-detail"),
]
