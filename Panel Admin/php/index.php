<?php
/**
 * Page d'accueil de la gestion des newsletters
 * Liste l'historique des newsletters envoyées et en brouillon
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/header.php';

$pageTitle = 'Gestion des Newsletters';

try {
    $pdo = getDBConnection();
    
    // Récupérer toutes les newsletters
    $stmt = $pdo->query("SELECT * FROM newsletters ORDER BY created_at DESC");
    $newsletters = $stmt->fetchAll();
    
} catch (PDOException $e) {
    $error = "Erreur de base de données : " . $e->getMessage();
}
?>

<div class="mb-8">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-3xl font-bold mb-2">Gestion des Newsletters</h1>
            <p class="text-slate-400">Créez, gérez et envoyez vos newsletters aux abonnés</p>
        </div>
        <a href="./newsletter_form.php" class="btn-primary px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
            <i class="fas fa-plus"></i>
            Rédiger une newsletter
        </a>
    </div>

    <?php if (isset($_GET['success'])): ?>
        <div class="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-6">
            <i class="fas fa-check-circle mr-2"></i>
            <?php 
            if ($_GET['success'] == 'draft') {
                echo 'Brouillon enregistré avec succès !';
            } elseif ($_GET['success'] == 'sent') {
                echo 'Newsletter envoyée avec succès à ' . htmlspecialchars($_GET['count']) . ' abonnés !';
            }
            ?>
        </div>
    <?php endif; ?>

    <?php if (isset($error)): ?>
        <div class="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <?php echo htmlspecialchars($error); ?>
        </div>
    <?php endif; ?>

    <div class="dark-card rounded-xl overflow-hidden">
        <table class="w-full">
            <thead class="bg-slate-800/50">
                <tr>
                    <th class="text-left px-6 py-4 text-sm font-semibold text-slate-300">Sujet</th>
                    <th class="text-left px-6 py-4 text-sm font-semibold text-slate-300">Statut</th>
                    <th class="text-left px-6 py-4 text-sm font-semibold text-slate-300">Créée le</th>
                    <th class="text-left px-6 py-4 text-sm font-semibold text-slate-300">Envoyée le</th>
                    <th class="text-right px-6 py-4 text-sm font-semibold text-slate-300">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($newsletters)): ?>
                    <tr>
                        <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                            <i class="fas fa-envelope-open-text text-4xl mb-4"></i>
                            <p>Aucune newsletter créée pour le moment.</p>
                            <a href="./newsletter_form.php" class="btn-primary inline-block mt-4 px-4 py-2 rounded-lg">
                                Créer votre première newsletter
                            </a>
                        </td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($newsletters as $newsletter): ?>
                        <tr class="border-t border-slate-700 hover:bg-slate-800/30">
                            <td class="px-6 py-4">
                                <div class="font-medium"><?php echo htmlspecialchars($newsletter['subject']); ?></div>
                                <div class="text-sm text-slate-400 truncate max-w-md">
                                    <?php echo htmlspecialchars(strip_tags($newsletter['content'])); ?>
                                </div>
                            </td>
                            <td class="px-6 py-4">
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
                            </td>
                            <td class="px-6 py-4 text-slate-300">
                                <?php echo date('d/m/Y H:i', strtotime($newsletter['created_at'])); ?>
                            </td>
                            <td class="px-6 py-4 text-slate-300">
                                <?php 
                                if ($newsletter['sent_at']) {
                                    echo date('d/m/Y H:i', strtotime($newsletter['sent_at']));
                                } else {
                                    echo '-';
                                }
                                ?>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <?php if ($newsletter['status'] === 'draft'): ?>
                                    <a href="./newsletter_form.php?id=<?php echo $newsletter['id']; ?>" 
                                       class="text-blue-400 hover:text-blue-300 mr-3" title="Modifier">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                <?php else: ?>
                                    <a href="./newsletter_view.php?id=<?php echo $newsletter['id']; ?>" 
                                       class="text-green-400 hover:text-green-300 mr-3" title="Voir le contenu">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                <?php endif; ?>
                                <a href="./newsletter_delete.php?id=<?php echo $newsletter['id']; ?>" 
                                   class="text-red-400 hover:text-red-300" 
                                   onclick="return confirm('Êtes-vous sûr de vouloir supprimer cette newsletter ?')"
                                   title="Supprimer">
                                    <i class="fas fa-trash"></i>
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <!-- Statistiques rapides -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div class="dark-card rounded-xl p-6">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <i class="fas fa-envelope text-blue-400 text-xl"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold"><?php echo count($newsletters); ?></p>
                    <p class="text-slate-400 text-sm">Total newsletters</p>
                </div>
            </div>
        </div>
        <div class="dark-card rounded-xl p-6">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <i class="fas fa-paper-plane text-green-400 text-xl"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold">
                        <?php 
                        $sentCount = array_filter($newsletters, fn($n) => $n['status'] === 'sent');
                        echo count($sentCount);
                        ?>
                    </p>
                    <p class="text-slate-400 text-sm">Envoyées</p>
                </div>
            </div>
        </div>
        <div class="dark-card rounded-xl p-6">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-lg bg-slate-500/10 flex items-center justify-center">
                    <i class="fas fa-file-alt text-slate-400 text-xl"></i>
                </div>
                <div>
                    <p class="text-2xl font-bold">
                        <?php 
                        $draftCount = array_filter($newsletters, fn($n) => $n['status'] === 'draft');
                        echo count($draftCount);
                        ?>
                    </p>
                    <p class="text-slate-400 text-sm">Brouillons</p>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
