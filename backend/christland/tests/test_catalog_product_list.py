# christland/tests/test_catalog_product_list.py

from django.test import TestCase, Client
from django.utils import timezone

from christland.models import (
    Categories,
    Produits,
    VariantesProduits,
    Marques,
    ImagesProduits,
)


class CategoryProductListTests(TestCase):
    """
    Tests sur /christland/api/catalog/products/ (CategoryProductList).
    """

    def setUp(self):
        self.client = Client()

        # -----------------------
        # Catégories
        # -----------------------
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

        # -----------------------
        # Marque
        # -----------------------
        self.brand = Marques.objects.create(
            nom="Christland Brand",
            slug="christland-brand",
            est_active=True,
        )

        # -----------------------
        # Produit 1 (dans la sous-catégorie)
        # -----------------------
        self.product1 = Produits.objects.create(
            nom="Laptop A",
            slug="laptop-a",
            categorie=self.cat_child,
            marque=self.brand,
            est_actif=True,
            visible=1,
            etat="neuf",
            cree_le=timezone.now(),
        )
        VariantesProduits.objects.create(
            produit=self.product1,
            nom="Laptop A 8 Go",
            sku="LA8",
            prix=1000,
            stock=3,
            est_actif=True,
        )
        ImagesProduits.objects.create(
            produit=self.product1,
            url="test/laptop-a.jpg",
            principale=True,
            position=1,
        )

        # -----------------------
        # Produit 2 (même catégorie)
        # -----------------------
        self.product2 = Produits.objects.create(
            nom="Laptop B",
            slug="laptop-b",
            categorie=self.cat_child,
            marque=self.brand,
            est_actif=True,
            visible=1,
            etat="neuf",
            cree_le=timezone.now(),
        )
        VariantesProduits.objects.create(
            produit=self.product2,
            nom="Laptop B 16 Go",
            sku="LB16",
            prix=1800,
            stock=2,
            est_actif=True,
        )

    def test_product_list_all_categories(self):
        """
        GET /christland/api/catalog/products/?category=tous
        -> renvoie une réponse paginée {count, results, ...}
        """
        url = "/christland/api/catalog/products/?category=tous"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

        data = resp.json()

        # structure paginée
        self.assertIn("results", data)
        self.assertIn("count", data)

        # il doit y avoir au moins 1 produit visible/actif
        self.assertGreaterEqual(data["count"], 1)

        results = data["results"]
        self.assertGreaterEqual(len(results), 1)

        # on vérifie la structure du premier produit
        first = results[0]
        self.assertIn("id", first)
        self.assertIn("slug", first)
        self.assertIn("nom", first)

    def test_product_list_by_category_slug(self):
        """
        Filtre par catégorie parent (informatique) -> doit inclure les produits
        de la sous-catégorie.
        """
        url = "/christland/api/catalog/products/?category=informatique"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

        data = resp.json()
        self.assertIn("results", data)

        slugs = [p["slug"] for p in data["results"]]
        self.assertIn("laptop-a", slugs)
        self.assertIn("laptop-b", slugs)

    def test_product_list_with_lang_en(self):
        """
        Vérifie simplement que la vue répond correctement avec ?lang=en
        (i18n + cache).
        """
        url = "/christland/api/catalog/products/?category=tous&lang=en"
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)

        data = resp.json()
        self.assertIn("results", data)
