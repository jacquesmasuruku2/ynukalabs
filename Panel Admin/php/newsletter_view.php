<?php
/**
 * Page pour visualiser le contenu d'une newsletter envoyée
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/header.php';

$pageTitle = 'Voir la Newsletter';

$newsletter = null;

if (isset($_GET['id'])) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT * FROM newsletters WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        $newsletter = $stmt->fetch();
    } catch (PDOException $e) {
        $error = "Erreur de base de données : " . $e->getMessage();
    }
} else {
    header('Location: ./index.php');
    exit();
}

if (!$newsletter) {
    header('Location: ./index.php');
    exit();
}
?>

<div class="mb-8">
    <div class="mb-6">
        <a href="./index.php" class="text-slate-400 hover:text-white mb-4 inline-block">
            <i class="fas fa-arrow-left mr-2"></i>Retour aux newsletters
        </a>
        <h1 class="text-3xl font-bold mb-2">Voir la newsletter</h1>
        <p class="text-slate-400">Contenu de la newsletter envoyée</p>
    </div>

    <?php if (isset($error)): ?>
        <div class="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <?php echo htmlspecialchars($error); ?>
        </div>
    <?php endif; ?>

    <div class="dark-card rounded-xl p-6 mb-6">
        <div class="mb-4">
            <label class="block text-sm font-medium text-slate-400 mb-2">Sujet</label>
            <p class="text-xl font-semibold"><?php echo htmlspecialchars($newsletter['subject']); ?></p>
        </div>
        
        <div class="mb-4">
            <label class="block text-sm font-medium text-slate-400 mb-2">Statut</label>
            <?php
            $badgeClass = '';
            $badgeText = '';
            switch ($newsletter['status']) {
                case 'sent':
                    $badgeClass = 'badge-sent';
                    $badgeText = 'Envoyée';
                    break;
                case 'sending':
                    $badgeClass = 'badge-sending';
                    $badgeText = 'Envoi en cours';
                    break;
                case 'draft':
                    $badgeClass = 'badge-draft';
                    $badgeText = 'Brouillon';
                    break;
            }
            ?>
            <span class="<?php echo $badgeClass; ?> px-3 py-1 rounded-full text-sm font-medium">
                <?php echo $badgeText; ?>
            </span>
        </div>
        
        <div class="mb-4">
            <label class="block text-sm font-medium text-slate-400 mb-2">Créée le</label>
            <p class="text-slate-300"><?php echo date('d/m/Y H:i', strtotime($newsletter['created_at'])); ?></p>
        </div>
        
        <?php if ($newsletter['sent_at']): ?>
            <div class="mb-4">
                <label class="block text-sm font-medium text-slate-400 mb-2">Envoyée le</label>
                <p class="text-slate-300"><?php echo date('d/m/Y H:i', strtotime($newsletter['sent_at'])); ?></p>
            </div>
        <?php endif; ?>
    </div>

    <div class="dark-card rounded-xl p-6">
        <label class="block text-sm font-medium text-slate-400 mb-4">Contenu HTML</label>
        <div class="bg-white rounded-lg p-6 text-slate-900">
            <?php echo $newsletter['content']; ?>
        </div>
    </div>

    <div class="mt-6 flex gap-4">
        <?php if ($newsletter['status'] === 'draft'): ?>
            <a href="./newsletter_form.php?id=<?php echo $newsletter['id']; ?>" 
               class="btn-primary px-6 py-3 rounded-lg font-semibold">
                <i class="fas fa-edit mr-2"></i>Modifier
            </a>
        <?php endif; ?>
        <a href="./index.php" class="px-6 py-3 rounded-lg bg-slate-600 text-white font-semibold hover:bg-slate-500 transition-colors">
            <i class="fas fa-arrow-left mr-2"></i>Retour
        </a>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
