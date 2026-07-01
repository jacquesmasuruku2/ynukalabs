<?php
/**
 * Formulaire de création/édition de newsletter
 * Intègre l'éditeur WYSIWYG TinyMCE
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/header.php';

$pageTitle = 'Rédiger une Newsletter';

$newsletter = null;
$isEdit = false;
$isReadOnly = false;

// Récupérer la newsletter si c'est une édition
if (isset($_GET['id'])) {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT * FROM newsletters WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        $newsletter = $stmt->fetch();
        
        if ($newsletter) {
            $isEdit = true;
            $isReadOnly = ($newsletter['status'] === 'sent');
        }
    } catch (PDOException $e) {
        $error = "Erreur de base de données : " . $e->getMessage();
    }
}
?>

<div class="mb-8">
    <div class="mb-6">
        <a href="./index.php" class="text-slate-400 hover:text-white mb-4 inline-block">
            <i class="fas fa-arrow-left mr-2"></i>Retour aux newsletters
        </a>
        <h1 class="text-3xl font-bold mb-2">
            <?php echo $isEdit ? 'Modifier la newsletter' : 'Rédiger une nouvelle newsletter'; ?>
        </h1>
        <p class="text-slate-400">
            <?php echo $isReadOnly ? 'Cette newsletter a déjà été envoyée (mode lecture seule)' : 'Créez et envoyez votre newsletter aux abonnés'; ?>
        </p>
    </div>

    <?php if (isset($error)): ?>
        <div class="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <?php echo htmlspecialchars($error); ?>
        </div>
    <?php endif; ?>

    <form action="save_and_send.php" method="POST" class="dark-card rounded-xl p-6">
        <input type="hidden" name="newsletter_id" value="<?php echo $newsletter['id'] ?? ''; ?>">
        
        <div class="mb-6">
            <label class="block text-sm font-medium mb-2">Sujet de l'email *</label>
            <input type="text" 
                   name="subject" 
                   value="<?php echo htmlspecialchars($newsletter['subject'] ?? ''); ?>"
                   class="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-amber-500 focus:outline-none"
                   placeholder="Ex: Nouveautés de Ynuka Labs - Juin 2026"
                   <?php echo $isReadOnly ? 'readonly' : ''; ?>
                   required>
        </div>

        <div class="mb-6">
            <label class="block text-sm font-medium mb-2">Contenu de l'email *</label>
            <textarea name="content" 
                      id="newsletter_content"
                      class="w-full h-96 px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:border-amber-500 focus:outline-none"
                      placeholder="Rédigez votre newsletter ici..."
                      <?php echo $isReadOnly ? 'readonly' : ''; ?>
                      required><?php echo htmlspecialchars($newsletter['content'] ?? ''); ?></textarea>
        </div>

        <?php if (!$isReadOnly): ?>
            <div class="flex gap-4">
                <button type="submit" name="action" value="draft" 
                        class="px-6 py-3 rounded-lg bg-slate-600 text-white font-semibold hover:bg-slate-500 transition-colors">
                    <i class="fas fa-save mr-2"></i>Enregistrer le brouillon
                </button>
                <button type="submit" name="action" value="send" 
                        class="btn-primary px-6 py-3 rounded-lg font-semibold"
                        onclick="return confirm('Êtes-vous sûr de vouloir envoyer cette newsletter à tous les abonnés actifs ?')">
                    <i class="fas fa-paper-plane mr-2"></i>Enregistrer et Diffuser
                </button>
            </div>
        <?php else: ?>
            <div class="bg-slate-800/50 rounded-lg p-4 mb-4">
                <p class="text-slate-400">
                    <i class="fas fa-info-circle mr-2"></i>
                    Cette newsletter a été envoyée le <?php echo date('d/m/Y H:i', strtotime($newsletter['sent_at'])); ?>.
                    Vous ne pouvez plus la modifier.
                </p>
            </div>
            <a href="./index.php" class="btn-primary inline-block px-6 py-3 rounded-lg font-semibold">
                <i class="fas fa-arrow-left mr-2"></i>Retour
            </a>
        <?php endif; ?>
    </form>
</div>

<!-- TinyMCE Editor -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js" referrerpolicy="origin"></script>
<script>
tinymce.init({
    selector: '#newsletter_content',
    height: 500,
    menubar: true,
    plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
        'bold italic forecolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
    readonly: <?php echo $isReadOnly ? 'true' : 'false'; ?>,
    setup: function (editor) {
        editor.on('change', function () {
            editor.save(); // Synchronise instantanément avec le textarea
        });
    }
});
</script>

<?php require_once __DIR__ . '/footer.php'; ?>
