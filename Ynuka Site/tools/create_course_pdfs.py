from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

OUT = Path("public/resources/courses")
OUT.mkdir(parents=True, exist_ok=True)

COURSES = [
    ("evolution-du-web", "L'evolution du Web", ["Web 1 : lire", "Web 2 : participer", "Web 3 : posseder", "Web 4 : cooperer"]),
    ("registres-distribues-dlt", "Les registres distribues (DLT)", ["Pourquoi partager un registre ?", "Noeuds et replication", "Consensus", "Cas d'usage"]),
    ("la-blockchain", "La Blockchain", ["Une chaine de blocs", "Transactions et signatures", "Portefeuilles", "Opportunites blockchain"]),
    ("blockchain-cardano", "La Blockchain Cardano", ["Cardano en bref", "ADA et preuve d'enjeu", "Outils de depart", "Construire sur Cardano"]),
    ("opportunites-blockchain", "Les opportunites de la blockchain", ["Des problemes avant la technologie", "Secteurs a impact", "Competences recherchees", "Passer a l'action"]),
]

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CourseTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=25, leading=30, textColor=white, spaceAfter=10))
styles.add(ParagraphStyle(name="CourseBody", parent=styles["BodyText"], fontSize=11, leading=17, textColor=HexColor("#233650"), spaceAfter=9))
styles.add(ParagraphStyle(name="CourseHeading", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=15, leading=20, textColor=HexColor("#0f2847"), spaceBefore=14, spaceAfter=6))

for slug, title, chapters in COURSES:
    doc = SimpleDocTemplate(str(OUT / f"{slug}.pdf"), pagesize=A4, leftMargin=22*mm, rightMargin=22*mm, topMargin=20*mm, bottomMargin=20*mm)
    story = []
    banner = Table([[Paragraph("YNUKA LEARNING", ParagraphStyle("label", fontName="Helvetica-Bold", fontSize=9, textColor=HexColor("#ffcc33"))), ""] , [Paragraph(title, styles["CourseTitle"]), ""]], colWidths=[166*mm, 0])
    banner.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), HexColor("#0f2847")), ("BOX", (0,0), (-1,-1), 0, HexColor("#0f2847")), ("LEFTPADDING", (0,0), (-1,-1), 12), ("RIGHTPADDING", (0,0), (-1,-1), 12), ("TOPPADDING", (0,0), (-1,-1), 11), ("BOTTOMPADDING", (0,0), (-1,-1), 11)]))
    story += [banner, Spacer(1, 10*mm), Paragraph("Support de cours", styles["CourseHeading"]), Paragraph("Ce support accompagne le parcours de formation Ynuka Labs. Il vous aide a retenir les idees essentielles, preparer les ateliers et prolonger votre apprentissage.", styles["CourseBody"])]
    for index, chapter in enumerate(chapters, 1):
        story += [Paragraph(f"{index:02d}. {chapter}", styles["CourseHeading"]), Paragraph("Retrouvez dans ce chapitre les notions fondamentales, des exemples concrets et des pistes de reflexion pour appliquer ces connaissances dans votre contexte.", styles["CourseBody"])]
    story += [Spacer(1, 7*mm), Paragraph("Ynuka Labs - apprendre, comprendre, construire.", ParagraphStyle("footer", parent=styles["BodyText"], fontSize=9, textColor=HexColor("#61738b")))]
    doc.build(story)
