# christland/urls.py
from django.urls import path
from .views import CategoryProductList, CategoryFilters, CategoryListView,ProductMiniView, BlogHeroView, BlogPostsView

app_name = "christland"

urlpatterns = [
    path("api/catalog/categories/", CategoryListView.as_view(), name="catalog-categories"),
    path("api/catalog/products/",   CategoryProductList.as_view(), name="catalog-products"),
    path("api/catalog/filters/",    CategoryFilters.as_view(),     name="catalog-filters"),
    path("christland/api/catalog/product/<str:pk_or_slug>/mini/", ProductMiniView.as_view()),
    path("api/blog/hero/", BlogHeroView.as_view(), name="api_blog_hero"),
    path("api/blog/posts/", BlogPostsView.as_view(), name="api_blog_posts"),
]
