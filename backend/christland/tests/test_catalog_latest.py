# christland/tests/test_catalog_latest.py

from django.test import TestCase, Client
from django.utils import timezone
from django.conf import settings

from christland.models import (
    Categories,
    Produits,
    VariantesProduits,
    Marques,
    ImagesProduits,
)


class LatestProductsViewTests(TestCase):
    """Tests basiques sur /christland/api/catalog/products/latest/"""

    def setUp(self):
        self.client = Client()

        # 1) Catégorie
        self.cat = Categories.objects.create(
            nom="Ordinateurs",
            slug="ordinateurs",
            est_actif=True,
        )

        # 2) Marque
        self.brand = Marques.objects.create(
            nom="Christland Brand",
            slug="christland-brand",
            est_active=True,
        )

        # 3) Produit
        self.product = Produits.objects.create(
            nom="Laptop Pro",
            slug="laptop-pro",
            categorie=self.cat,
            marque=self.brand,
            est_actif=True,
            visible=1,
            etat="neuf",
            cree_le=timezone.now(),
        )

        # 4) Variante (avec prix)
        self.variant = VariantesProduits.objects.create(
            produit=self.product,
            nom="Laptop Pro 16 Go",
            sku="LP16",
            prix=1500,
            stock=5,
            est_actif=True,
        )

        # 5) Image principale
        ImagesProduits.objects.create(
            produit=self.product,
            url="test/laptop.jpg",  # chemin relatif dans MEDIA_ROOT
            principale=True,
            position=1,
        )

    def test_latest_products_fr(self):
        """La vue doit répondre 200 et renvoyer au moins un produit (FR)."""
        url = "/christland/api/catalog/products/latest/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # LatestProductsView renvoie une LISTE simple
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)

        first = data[0]
        self.assertIn("nom", first)         # <- changé
        self.assertIn("image", first)
        self.assertIn("price", first)
        self.assertIn("nom", first)
        self.assertTrue(first["nom"])  # le nom ne doit pas être vide


    def test_latest_products_en(self):
        """Même chose avec ?lang=en (i18n + cache)."""
        url = "/christland/api/catalog/products/latest/?lang=en"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)
