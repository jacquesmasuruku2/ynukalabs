<?php
/**
 * Page publique de désabonnement de la newsletter
 * Accessible sans authentification admin
 */
require_once __DIR__ . '/config.php';

$email = $_GET['email'] ?? '';
$message = '';
$messageType = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['confirm_unsubscribe'])) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("UPDATE newsletter_subscribers SET active = 0, updated_at = NOW() WHERE email = ?");
        $stmt->execute([$email]);
        
        if ($stmt->rowCount() > 0) {
            $message = "Vous avez été désabonné avec succès de notre newsletter.";
            $messageType = "success";
        } else {
            $message = "Aucun abonnement trouvé pour cet email ou déjà désabonné.";
            $messageType = "warning";
        }
    } catch (PDOException $e) {
        $message = "Une erreur est survenue. Veuillez réessayer.";
        $messageType = "error";
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Désabonnement - Ynuka Labs</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root {
            --primary: #ffb800;
            --primary-dark: #e6a500;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .btn-primary {
            background-color: var(--primary);
            color: #111;
            transition: all 0.2s;
        }
        .btn-primary:hover {
            background-color: var(--primary-dark);
        }
    </style>
</head>
<body class="bg-slate-900 min-h-screen flex items-center justify-center p-4">
    <div class="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
        <div class="text-center mb-6">
            <div class="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-envelope-open text-amber-500 text-2xl"></i>
            </div>
            <h1 class="text-2xl font-bold text-white mb-2">Désabonnement de la newsletter</h1>
            <p class="text-slate-400">Ynuka Labs</p>
        </div>

        <?php if ($message): ?>
            <div class="mb-6 p-4 rounded-lg <?php echo $messageType === 'success' ? 'bg-green-500/10 border border-green-500 text-green-500' : ($messageType === 'warning' ? 'bg-amber-500/10 border border-amber-500 text-amber-500' : 'bg-red-500/10 border border-red-500 text-red-500'); ?>">
                <i class="fas fa-<?php echo $messageType === 'success' ? 'check-circle' : ($messageType === 'warning' ? 'exclamation-triangle' : 'times-circle'); ?> mr-2"></i>
                <?php echo htmlspecialchars($message); ?>
            </div>
        <?php endif; ?>

        <?php if (!$message || $messageType !== 'success'): ?>
            <div class="mb-6">
                <p class="text-slate-300 mb-4">
                    Vous êtes sur le point de vous désabonner de la newsletter Ynuka Labs pour l'adresse :
                </p>
                <div class="bg-slate-900 rounded-lg p-3 text-center">
                    <span class="text-amber-500 font-medium"><?php echo htmlspecialchars($email); ?></span>
                </div>
            </div>

            <form method="POST" class="space-y-4">
                <button type="submit" name="confirm_unsubscribe" value="1" 
                        class="w-full btn-primary py-3 rounded-lg font-semibold">
                    <i class="fas fa-check mr-2"></i>Confirmer le désabonnement
                </button>
                
                <a href="https://ynukalabs.com" class="block text-center text-slate-400 hover:text-white py-2">
                    Annuler et retourner sur le site
                </a>
            </form>
        <?php else: ?>
            <div class="space-y-4">
                <a href="https://ynukalabs.com" class="block btn-primary text-center py-3 rounded-lg font-semibold">
                    <i class="fas fa-home mr-2"></i>Retourner sur le site
                </a>
                
                <a href="https://ynukalabs.com/contact" class="block text-center text-slate-400 hover:text-white py-2">
                    Nous contacter si vous avez des questions
                </a>
            </div>
        <?php endif; ?>

        <div class="mt-8 pt-6 border-t border-slate-700 text-center text-slate-500 text-sm">
            <p>© <?php echo date('Y'); ?> Ynuka Labs. Tous droits réservés.</p>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"></script>
</body>
</html>
