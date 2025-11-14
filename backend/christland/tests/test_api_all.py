# christland/tests/test_api_all.py

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from django.urls import reverse

from christland.models import (
    Categories,
    Produits,
    VariantesProduits,
    ImagesProduits,
    Marques,
    Couleurs,
    ArticlesBlog,
    MessagesContact,
    Utilisateurs,
)
from christland.auth_jwt import make_access_token, make_refresh_token


class BaseApiSetupMixin:
    """
    Mixin qui crée un minimum de données pour tester la plupart des vues.
    """

    def setUp(self):
        self.client = APIClient()

        # ----- Catégories -----
        self.cat_root = Categories.objects.create(
            nom="Informatique",
            slug="informatique",
            est_actif=True,
        )
        self.cat_child = Categories.objects.create(
            nom="Ordinateurs portables",
            slug="ordinateurs-portables",
            est_actif=True,
            parent=self.cat_root,
        )

        # ----- Marque -----
        self.brand = Marques.objects.create(
            nom="Christland Brand",
            slug="christland-brand",
            est_active=True,
        )

        # ----- Couleur -----
        self.color = Couleurs.objects.create(
            nom="Noir",
            slug="noir",
            code_hex="#000000",
            est_active=True,
        )

        # ----- Produit + variante + image -----
        self.product = Produits.objects.create(
            nom="Ordinateur portable gamer",
            slug="ordinateur-portable-gamer",
            categorie=self.cat_child,
            marque=self.brand,
            est_actif=True,
            visible=1,
            etat="neuf",
            cree_le=timezone.now(),
        )
        self.variant = VariantesProduits.objects.create(
            produit=self.product,
            nom="Variante 16 Go",
            sku="SKU-16GO",
            prix=1500,
            stock=5,
            est_actif=True,
            couleur=self.color,
        )
        ImagesProduits.objects.create(
            produit=self.product,
            url="test/laptop.jpg",
            principale=True,
            position=1,
        )

        # ----- Article de blog -----
        self.article = ArticlesBlog.objects.create(
            titre="Article test",
            slug="article-test",
            extrait="Extrait de test",
            contenu="Contenu de test",
            image_couverture="blog/cover.jpg",
            cree_le=timezone.now(),
        )

        # ----- Utilisateur dashboard (admin) -----
        self.admin = Utilisateurs.objects.create(
            email="admin@test.com",
            mot_de_passe_hash="",
            prenom="Admin",
            nom="Test",
            role="admin",
            actif=True,
            cree_le=timezone.now(),
            modifie_le=timezone.now(),
        )
        # on ne teste pas ici le hash, juste le JWT
        self.access_token = make_access_token(self.admin)
        self.refresh_token = make_refresh_token(self.admin)


# ============================================================
# 1) API CATALOGUE PUBLIC
# ============================================================

class CatalogApiTests(BaseApiSetupMixin, TestCase):
    """
    Tests globaux des vues catalogue (produits, filtres, catégories, latest, most-demanded…)
    """

    def test_category_product_list_all(self):
        """
        GET /christland/api/catalog/products/?category=tous
        -> 200 + pagination avec "results" et "count"
        """
        url = "/christland/api/catalog/products/?category=tous"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

        data = resp.json()
        self.assertIn("results", data)
        self.assertIn("count", data)
        self.assertGreaterEqual(data["count"], 1)
        slugs = [p["slug"] for p in data["results"]]
        self.assertIn("ordinateur-portable-gamer", slugs)

    def test_category_filters(self):
        """
        GET /christland/api/catalog/filters/?category=tous
        -> 200 + présence de brands/colors/price/states
        """
        url = "/christland/api/catalog/filters/?category=tous"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

        data = resp.json()
        self.assertIn("brands", data)
        self.assertIn("colors", data)
        self.assertIn("price", data)
        self.assertIn("states", data)

    def test_category_list_public(self):
        """
        GET /christland/api/catalog/categories/?level=1
        -> 200 + au moins la catégorie racine
        """
        url = "/christland/api/catalog/categories/?level=1"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

        data = resp.json()
        slugs = [c["slug"] for c in data]
        self.assertIn("informatique", slugs)

    def test_product_mini_view_by_slug(self):
        """
        GET /christland/api/catalog/product/<slug>/mini/
        -> 200 + champs id/slug/nom/ref/image
        """
        url = f"/christland/api/catalog/product/{self.product.slug}/mini/"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

        data = resp.json()
        self.assertIn("id", data)
        self.assertIn("slug", data)
        self.assertIn("nom", data)
        self.assertIn("ref", data)
        self.assertIn("image", data)

    def test_latest_products_public_fr(self):
        """
        GET /christland/api/catalog/products/latest/
        -> 200 + liste non vide
        """
        url = "/christland/api/catalog/products/latest/"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

        data = resp.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)
        first = data[0]
        self.assertIn("nom", first)
        self.assertIn("slug", first)

    def test_latest_products_public_en(self):
        """
        GET /christland/api/catalog/products/latest/?lang=en
        -> 200 (test i18n + cache)
        """
        url = "/christland/api/catalog/products/latest/?lang=en"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        # on ne vérifie que que ça répond bien

    def test_most_demanded_products(self):
        """
        GET /christland/api/catalog/products/most-demanded/?limit=2
        -> 200 + liste avec price + state
        """
        # simuler quelques clics
        for _ in range(3):
            self.client.post(f"/christland/api/catalog/products/{self.product.id}/click/")

        url = "/christland/api/catalog/products/most-demanded/?limit=2"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

        data = resp.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)
        first = data[0]
        self.assertIn("price", first)
        self.assertIn("state", first)

    def test_marques_list(self):
        """
        GET /christland/api/catalog/marques/
        -> 200 + au moins une marque
        """
        url = "/christland/api/catalog/marques/"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreaterEqual(len(data), 1)
        self.assertIn("nom", data[0])

    def test_couleurs_list(self):
        """
        GET /christland/api/catalog/couleurs/
        -> 200 + au moins une couleur
        """
        url = "/christland/api/catalog/couleurs/"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreaterEqual(len(data), 1)
        self.assertIn("code_hex", data[0])


# ============================================================
# 2) BLOG PUBLIC
# ============================================================

class BlogApiTests(BaseApiSetupMixin, TestCase):
    def test_blog_hero(self):
        url = "/christland/api/blog/hero/"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("title", data)
        self.assertIn("slug", data)

    def test_blog_posts(self):
        url = "/christland/api/blog/posts/"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("top", data)
        self.assertIn("bottom", data)

    def test_blog_latest(self):
        url = "/christland/api/blog/latest/?limit=1"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)


# ============================================================
# 3) CONTACT
# ============================================================

class ContactApiTests(BaseApiSetupMixin, TestCase):
    def test_contact_post_and_get(self):
        """
        POST + GET /christland/api/contact/messages/
        """
        url = "/christland/api/contact/messages/"

        # POST
        payload = {
            "nom": "Simon",
            "email": "test@example.com",
            "telephone": "600000000",
            "sujet": "Test",
            "message": "Bonjour, ceci est un test.",
        }
        resp_post = self.client.post(url, data=payload, format="json")
        self.assertEqual(resp_post.status_code, 201)

        # GET
        resp_get = self.client.get(url)
        self.assertEqual(resp_get.status_code, 200)
        data = resp_get.json()
        self.assertGreaterEqual(len(data), 1)
        self.assertIn("message", data[0])


# ============================================================
# 4) DASHBOARD AUTH + ME
# ============================================================

class DashboardAuthTests(BaseApiSetupMixin, TestCase):
    def test_login_invalid(self):
        """
        POST /christland/api/dashboard/auth/login/ avec mauvais mdp -> 401
        """
        url = "/christland/api/dashboard/auth/login/"
        payload = {"email": "admin@test.com", "password": "wrong"}
        resp = self.client.post(url, data=payload, format="json")
        self.assertEqual(resp.status_code, 401)

    def test_me_requires_auth(self):
        url = "/christland/api/dashboard/auth/me/"
        resp = self.client.get(url)
        self.assertIn(resp.status_code, (401, 403))

    def test_me_with_token(self):
        url = "/christland/api/dashboard/auth/me/"
        resp = self.client.get(
            url,
            HTTP_AUTHORIZATION=f"Bearer {self.access_token}",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["email"], self.admin.email)

    def test_refresh_with_token(self):
        url = "/christland/api/dashboard/auth/refresh/"
        resp = self.client.post(url, data={"refresh": self.refresh_token}, format="json")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("access", data)


# ============================================================
# 5) DASHBOARD STATS
# ============================================================

class DashboardStatsTests(BaseApiSetupMixin, TestCase):
    def test_dashboard_stats_requires_auth(self):
        url = "/christland/api/dashboard/stats/"
        resp = self.client.get(url)
        self.assertIn(resp.status_code, (401, 403))


    def test_dashboard_stats_ok_with_token(self):
        url = "/christland/api/dashboard/stats/"
        resp = self.client.get(
            url,
            HTTP_AUTHORIZATION=f"Bearer {self.access_token}",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("users", data)
        self.assertIn("products_stock", data)
        self.assertIn("articles", data)
        self.assertIn("messages", data)


# ============================================================
# 6) DASHBOARD PRODUITS (LIST + EDIT DATA)
# ============================================================

class DashboardProductsTests(BaseApiSetupMixin, TestCase):
    def test_dashboard_products_list_requires_auth(self):
        url = "/christland/api/dashboard/produits/"
        resp = self.client.get(url)
        self.assertIn(resp.status_code, (401, 403))


    def test_dashboard_products_list_ok(self):
        url = "/christland/api/dashboard/produits/"
        resp = self.client.get(
            url,
            HTTP_AUTHORIZATION=f"Bearer {self.access_token}",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("results", data)
        self.assertGreaterEqual(data["count"], 1)

    def test_dashboard_product_edit_data_ok(self):
        url = f"/christland/api/dashboard/produits/{self.product.id}/edit/"
        resp = self.client.get(
            url,
            HTTP_AUTHORIZATION=f"Bearer {self.access_token}",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["id"], self.product.id)
        self.assertIn("images", data)
        self.assertIn("variant", data)


# ============================================================
# 7) ADMIN GLOBAL SEARCH
# ============================================================

class AdminGlobalSearchTests(BaseApiSetupMixin, TestCase):
    def test_admin_global_search_requires_auth(self):
        url = "/christland/api/dashboard/search/?q=test"
        resp = self.client.get(url)
        self.assertIn(resp.status_code, (401, 403))


    def test_admin_global_search_ok(self):
        url = "/christland/api/dashboard/search/?q=test"
        resp = self.client.get(
            url,
            HTTP_AUTHORIZATION=f"Bearer {self.access_token}",
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("results", data)
        self.assertIn("count", data)
