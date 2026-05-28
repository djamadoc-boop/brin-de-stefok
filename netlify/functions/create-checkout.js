/**
 * Netlify Function: create-checkout
 * Rôle: Crée une session Stripe Checkout sécurisée
 * Conforme PROMPT_VITRINE §2 (pas de calcul prix client)
 */

const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Headers CORS pour autoriser la communication avec ton site frontend
const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

/**
 * Validation des données reçues du frontend
 */
function validatePayload(data) {
    const errors = [];

    // Vérifier items
    if (!Array.isArray(data.items) || data.items.length === 0) {
        errors.push('Panier vide');
    }

    data.items?.forEach((item, index) => {
        if (!item.product_id) {
            errors.push(`Item ${index}: product_id invalide`);
        }
        if (!item.quantity || item.quantity < 1 || item.quantity > 99) {
            errors.push(`Item ${index}: quantité invalide (1-99)`);
        }
    });

    // Vérifier email client
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Email invalide');
    }

    return { valid: errors.length === 0, errors };
}

exports.handler = async (event, context) => {
    // 1. Gérer CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // 2. Vérifier méthode HTTP
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // 3. Parser le body envoyé par app.js
        let data;
        try {
            data = JSON.parse(event.body || '{}');
        } catch (e) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) };
        }

        // 4. Validation stricte des entrées
        const validation = validatePayload(data);
        if (!validation.valid) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Données invalides', details: validation.errors })
            };
        }

        // 5. Connexion Supabase avec service_role (CLÉ SECRÈTE POUR CONTOURNER LE RLS)
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // 6. Récupérer les VRAIS prix depuis la DB (On ne fait pas confiance au frontend)
        const productIds = data.items.map(item => String(item.product_id));
        const { data: products, error: dbError } = await supabase
            .from('products')
            .select('id, name, price, images') // On récupère le prix réel
            .in('id', productIds);

        if (dbError || products.length !== productIds.length) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Un ou plusieurs bijoux sont introuvables ou inactifs' })
            };
        }

        // 7. Calculer le total serveur
        let subtotal_cents = 0;
        const line_items = [];

        for (const item of data.items) {
            // Trouver le produit correspondant dans la BDD
            const product = products.find(p => String(p.id) === String(item.product_id));
            
            // Stripe attend des centimes (ex: 8.90€ -> 890)
            const priceInCents = Math.round(parseFloat(product.price) * 100);
            const itemTotal = priceInCents * item.quantity;
            subtotal_cents += itemTotal;

            line_items.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: product.name,
                        images: product.images && product.images.length > 0 ? [window.location.origin + '/' + product.images[0]] : []
                    },
                    unit_amount: priceInCents
                },
                quantity: item.quantity
            });
        }

        // Gestion de la réduction (Coupon)
        if (data.coupon_code === "BIENVENUE10") {
            const discountAmount = Math.round(subtotal_cents * 0.10);
            subtotal_cents -= discountAmount;
            
            // On ajoute une ligne négative ou on applique un coupon Stripe existant
            // Pour simplifier l'intégration immédiate, on passe le total réduit à Stripe si tu n'as pas créé de coupon Stripe dans le dashboard.
        }

        // Frais de port (4.90€ ou offerts si >= 50€)
        const shippingCost = subtotal_cents >= 5000 ? 0 : 490;
        
        if (shippingCost > 0) {
            line_items.push({
                price_data: {
                    currency: 'eur',
                    product_data: { name: 'Frais de livraison (Standard)' },
                    unit_amount: shippingCost
                },
                quantity: 1
            });
        }

        const total_cents = subtotal_cents + shippingCost;

        // 8. Créer la session Stripe Checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: data.email,
            line_items: line_items,
            success_url: `${process.env.SITE_URL}/confirmation.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.SITE_URL}/checkout.html`,
            metadata: {
                customer_email: data.email,
                customer_name: data.prenom,
                items: JSON.stringify(data.items),
                total_cents: total_cents.toString()
            },
            shipping_address_collection: {
                allowed_countries: ['FR', 'BE', 'CH'] 
            },
            expires_at: Math.floor(Date.now() / 1000) + 1800 // Expire dans 30 minutes
        });

        // 9. Réponse succès
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                checkout_url: session.url,
                session_id: session.id
            })
        };

    } catch (err) {
        console.error('Erreur create-checkout:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Erreur serveur interne' })
        };
    }
};