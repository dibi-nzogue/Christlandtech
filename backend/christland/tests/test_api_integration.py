# christland/tests/test_api_integration.py

from django.utils import timezone
from django.contrib.auth.hashers import make_password

from rest_framework.test import APITestCase
from rest_framework import status

from christland.models import (
    Categories,
    Produits,
    VariantesProduits,
    Marques,
    ImagesProduits,
    ArticlesBlog,
    Utilisateurs,
)


class ChristlandApiIntegrationTests(APITestCase):
    """
    Tests d'intégration "end-to-end" des principales API Christland.
    On utilise ici APITestCase (DRF) pour tester :
      - catalogue public (products, most-demanded)
      - blog (latest, posts)
      - auth dashboard (register, login, me)
      - stats dashboard
      - recherche globale dashboard
    """

    @classmethod
    def setUpTestData(cls):
        # ---------- CATALOGUE ----------
        # Catégorie
        cls.cat = Categories.objects.create(
            nom="Informatique",
            slug="informatique",
            est_actif=True,
        )
        cls.cat_sub = Categories.objects.create(
            nom="Ordinateurs portables",
            slug="ordinateurs-portables",
            est_actif=True,
            parent=cls.cat,
        )

        # Marque
        cls.brand = Marques.objects.create(
            nom="Christland Brand",
            slug="christland-brand",
            est_active=True,
        )

        # Produit 1
        cls.prod1 = Produits.objects.create(
            nom="Ordinateur portable gamer",
            slug="ordinateur-portable-gamer",
            categorie=cls.cat_sub,
            marque=cls.brand,
            est_actif=True,
            visible=1,
            etat="neuf",
            cree_le=timezone.now(),
        )
        VariantesProduits.objects.create(
            produit=cls.prod1,
            nom="Gamer 16 Go",
            sku="GAMER16",
            prix=1500,
            stock=5,
            est_actif=True,
        )
        ImagesProduits.objects.create(
            produit=cls.prod1,
            url="test/gamer.jpg",
            principale=True,
            position=1,
        )

        # Produit 2 (pour most-demanded + search)
        cls.prod2 = Produits.objects.create(
            nom="Laptop bureautique",
            slug="laptop-bureautique",
            categorie=cls.cat_sub,
            marque=cls.brand,
            est_actif=True,
            visible=1,
            etat="neuf",
            cree_le=timezone.now(),
            commande_count=3,
        )
        VariantesProduits.objects.create(
            produit=cls.prod2,
            nom="Bureau 8 Go",
            sku="BUREAU8",
            prix=900,
            stock=2,
            est_actif=True,
        )

        # ---------- BLOG ----------
        cls.article1 = ArticlesBlog.objects.create(
            titre="Premier article",
            slug="premier-article",
            extrait="Intro 1",
            contenu="Contenu 1",
            cree_le=timezone.now(),
        )
        cls.article2 = ArticlesBlog.objects.create(
            titre="Deuxième article",
            slug="deuxieme-article",
            extrait="Intro 2",
            contenu="Contenu 2",
            cree_le=timezone.now(),
        )
        cls.article3 = ArticlesBlog.objects.create(
            titre="Troisième article",
            slug="troisieme-article",
            extrait="Intro 3",
            contenu="Contenu 3",
            cree_le=timezone.now(),
        )

        # ---------- UTILISATEUR ADMIN (pour dashboard) ----------
        cls.admin_user = Utilisateurs.objects.create(
            email="admin@example.com",
            mot_de_passe_hash=make_password("admin123"),
            prenom="Admin",
            nom="Test",
            actif=True,
            role="admin",
            cree_le=timezone.now(),
            modifie_le=timezone.now(),
        )

    # ============================================================
    # 1) CATALOGUE PUBLIC
    # ============================================================

    def test_catalog_products_public_list_ok(self):
        """
        GET /christland/api/catalog/products/?category=tous
        -> 200 + structure paginée avec au moins un produit.
        """
        url = "/christland/api/catalog/products/?category=tous&lang=fr"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)

        self.assertIn("results", resp.data)
        self.assertIn("count", resp.data)
        self.assertGreaterEqual(resp.data["count"], 1)

        first = resp.data["results"][0]
        self.assertIn("id", first)
        self.assertIn("slug", first)
        self.assertIn("nom", first)
        self.assertIn("image", first)
        self.assertIn("price", first)

    def test_catalog_products_search_in_english_laptop(self):
        """
        GET /christland/api/catalog/products/?category=tous&q=laptop&lang=en
        -> 200, ne crash pas, renvoie au moins 1 résultat.
        (On teste surtout le pipeline i18n + _normalize_search_query)
        """
        url = "/christland/api/catalog/products/?category=tous&q=laptop&lang=en"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        self.assertIn("results", resp.data)
        # Pas besoin d'exiger un nom précis, on vérifie juste que ça tourne
        self.assertGreaterEqual(len(resp.data["results"]), 1)

    def test_most_demanded_products_public_ok(self):
        """
        GET /christland/api/catalog/products/most-demanded/?limit=2
        -> 200 + au moins 1 produit avec count trié
        """
        url = "/christland/api/catalog/products/most-demanded/?limit=2"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)

        self.assertIsInstance(resp.data, list)
        self.assertGreaterEqual(len(resp.data), 1)

        first = resp.data[0]
        self.assertIn("id", first)
        self.assertIn("slug", first)
        self.assertIn("nom", first)
        self.assertIn("price", first)

    # ============================================================
    # 2) BLOG PUBLIC
    # ============================================================

    def test_blog_latest_ok(self):
        """
        GET /christland/api/blog/latest/?limit=2
        -> 200 + 2 articles max avec {id, slug, title, excerpt, image}
        """
        url = "/christland/api/blog/latest/?limit=2"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)

        self.assertIsInstance(resp.data, list)
        self.assertGreaterEqual(len(resp.data), 1)
        self.assertLessEqual(len(resp.data), 2)

        first = resp.data[0]
        self.assertIn("id", first)
        self.assertIn("slug", first)
        self.assertIn("title", first)
        self.assertIn("excerpt", first)
        self.assertIn("image", first)

    def test_blog_posts_ok(self):
        """
        GET /christland/api/blog/posts/
        -> 200 + structure {top: [...], bottom: [...]}
        """
        url = "/christland/api/blog/posts/"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)

        self.assertIn("top", resp.data)
        self.assertIn("bottom", resp.data)
        self.assertIsInstance(resp.data["top"], list)
        self.assertIsInstance(resp.data["bottom"], list)

    # ============================================================
    # 3) AUTH DASHBOARD (register, login, me)
    # ============================================================

    def test_register_first_admin_ok(self):
        """
        POST /christland/api/dashboard/auth/register/
        -> crée un admin quand aucun admin n'existe encore.
        (Ici on supprime l'admin existant pour simuler le premier run.)
        """
        Utilisateurs.objects.all().delete()

        url = "/christland/api/dashboard/auth/register/"
        payload = {
            "email": "firstadmin@example.com",
            "password": "secret123",
            "prenom": "First",
            "nom": "Admin",
        }
        resp = self.client.post(url, payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)
        self.assertIn("user", resp.data)
        self.assertEqual(resp.data["user"]["email"], "firstadmin@example.com")
        self.assertEqual(resp.data["user"]["role"], "admin")

    def test_login_and_me_flow_ok(self):
        """
        POST /christland/api/dashboard/auth/login/ puis GET /me/
        -> 200, retourne le profil de l'utilisateur connecté.
        """
        login_url = "/christland/api/dashboard/auth/login/"
        payload = {"email": "admin@example.com", "password": "admin123"}

        resp_login = self.client.post(login_url, payload, format="json")
        self.assertEqual(resp_login.status_code, status.HTTP_200_OK, resp_login.data)
        self.assertIn("access", resp_login.data)

        access = resp_login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        me_url = "/christland/api/dashboard/auth/me/"
        resp_me = self.client.get(me_url)
        self.assertEqual(resp_me.status_code, status.HTTP_200_OK, resp_me.data)
        self.assertEqual(resp_me.data["email"], "admin@example.com")
        self.assertEqual(resp_me.data["role"], "admin")

    def test_me_requires_auth(self):
        """
        GET /christland/api/dashboard/auth/me/ sans token
        -> 403 Forbidden (non authentifié).
        """
        url = "/christland/api/dashboard/auth/me/"
        resp = self.client.get(url)
        self.assertEqual(
            resp.status_code,
            status.HTTP_403_FORBIDDEN,
            msg=f"Status attendu 403, reçu {resp.status_code} avec data={getattr(resp, 'data', resp.content)}",
        )

    # ============================================================
    # 4) STATS DASHBOARD
    # ============================================================

    def test_dashboard_stats_requires_auth(self):
        """
        GET /christland/api/dashboard/stats/ sans token
        -> 403 Forbidden (non authentifié).
        """
        url = "/christland/api/dashboard/stats/"
        resp = self.client.get(url)
        self.assertEqual(
            resp.status_code,
            status.HTTP_403_FORBIDDEN,
            msg=f"Status attendu 403, reçu {resp.status_code} avec data={getattr(resp, 'data', resp.content)}",
        )

    def test_dashboard_stats_with_auth_ok(self):
        """
        GET /christland/api/dashboard/stats/ avec token admin
        -> 200 + clés attendues.
        """
        # login admin
        login_url = "/christland/api/dashboard/auth/login/"
        payload = {"email": "admin@example.com", "password": "admin123"}
        resp_login = self.client.post(login_url, payload, format="json")
        self.assertEqual(resp_login.status_code, status.HTTP_200_OK, resp_login.data)
        access = resp_login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        url = "/christland/api/dashboard/stats/"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)

        self.assertIn("users", resp.data)
        self.assertIn("products_stock", resp.data)
        self.assertIn("products", resp.data)
        self.assertIn("articles", resp.data)
        self.assertIn("messages", resp.data)

    # ============================================================
    # 5) RECHERCHE GLOBALE DASHBOARD
    # ============================================================

    def test_admin_global_search_requires_auth(self):
        """
        GET /christland/api/dashboard/search/?q=... sans token
        -> 403 Forbidden (non authentifié).
        """
        url = "/christland/api/dashboard/search/?q=laptop"
        resp = self.client.get(url)
        self.assertEqual(
            resp.status_code,
            status.HTTP_403_FORBIDDEN,
            msg=f"Status attendu 403, reçu {resp.status_code} avec data={getattr(resp, 'data', resp.content)}",
        )

    def test_admin_global_search_with_auth_ok(self):
        """
        GET /christland/api/dashboard/search/?q=... avec token admin
        -> 200 + au moins 1 résultat (produit et/ou article).
        """
        # login admin
        login_url = "/christland/api/dashboard/auth/login/"
        payload = {"email": "admin@example.com", "password": "admin123"}
        resp_login = self.client.post(login_url, payload, format="json")
        self.assertEqual(resp_login.status_code, status.HTTP_200_OK, resp_login.data)
        access = resp_login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        url = "/christland/api/dashboard/search/?q=article"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)

        self.assertIn("count", resp.data)
        self.assertIn("results", resp.data)
        self.assertGreaterEqual(resp.data["count"], 1)
        self.assertGreaterEqual(len(resp.data["results"]), 1)
