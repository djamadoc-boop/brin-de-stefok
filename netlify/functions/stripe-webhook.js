/**
 * Netlify Function: stripe-webhook
 * Rôle: Écoute les confirmations de paiement de Stripe et enregistre la commande dans Supabase
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
    // 1. Stripe envoie une signature de sécurité dans les en-têtes
    const sig = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let stripeEvent;

    try {
        // 2. On vérifie que c'est bien Stripe qui nous parle (Grâce à ta clé whsec_)
        stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
    } catch (err) {
        console.error(`❌ Erreur de signature Webhook : ${err.message}`);
        return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    // 3. Si le paiement est validé avec succès
    if (stripeEvent.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object;

        console.log(`✅ Paiement reçu pour la session : ${session.id}`);

        // Connexion à Supabase avec les droits maximums
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Récupération des informations qu'on avait cachées dans les "metadata" lors du checkout
        const customerEmail = session.metadata.customer_email;
        const customerName = session.metadata.customer_name;
        const items = JSON.parse(session.metadata.items || '[]');
        const totalAmount = session.amount_total / 100; // On repasse des centimes aux euros

        try {
            // 4. On enregistre la commande officielle dans ta base de données Supabase
            // (Il faudra t'assurer d'avoir une table "commandes" dans ton Supabase)
            const { data, error } = await supabase
                .from('commandes')
                .insert([{
                    stripe_session_id: session.id,
                    email_client: customerEmail,
                    nom_client: customerName,
                    montant_total: totalAmount,
                    statut: 'payé',
                    contenu_panier: items // Stocke le JSON des ID produits et quantités
                }]);

            if (error) throw error;
            console.log("🛒 Commande insérée dans Supabase avec succès !");
            
            // BONUS : Ici tu pourrais ajouter du code pour envoyer un e-mail automatique à Stef 
            // pour dire "Nouvelle commande à préparer !"

        } catch (dbError) {
            console.error("❌ Erreur lors de l'insertion Supabase :", dbError);
            // On renvoie 200 quand même à Stripe pour qu'il arrête d'essayer, 
            // mais on garde la trace de l'erreur dans les logs Netlify.
        }
    }

    // 5. On répond à Stripe que tout s'est bien passé
    return {
        statusCode: 200,
        body: JSON.stringify({ received: true })
    };
};