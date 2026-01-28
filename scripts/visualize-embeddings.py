#!/usr/bin/env python3
"""
Visualize prompt embeddings in 2D using PCA.
Install dependencies: pip install psycopg2-binary numpy scikit-learn matplotlib
"""

import psycopg2
import numpy as np
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

# Connect to database
conn = psycopg2.connect(
    "postgresql://matrix:matrix123@localhost:5432/proompty"
)
cur = conn.cursor()

# Fetch embeddings with titles
cur.execute("""
    SELECT p.title, pe.embedding::text
    FROM prompt_embeddings pe
    JOIN prompts p ON pe.prompt_id = p.id
""")
rows = cur.fetchall()

if len(rows) < 2:
    print("Need at least 2 embeddings to visualize")
    exit()

titles = [row[0][:30] for row in rows]  # Truncate titles
embeddings = []

for row in rows:
    # Parse the vector string [0.1, 0.2, ...] to numpy array
    vec_str = row[1].strip('[]')
    vec = np.array([float(x) for x in vec_str.split(',')])
    embeddings.append(vec)

embeddings = np.array(embeddings)

# Reduce to 2D using PCA
pca = PCA(n_components=2)
reduced = pca.fit_transform(embeddings)

# Plot
plt.figure(figsize=(12, 8))
plt.scatter(reduced[:, 0], reduced[:, 1], s=100, alpha=0.7)

for i, title in enumerate(titles):
    plt.annotate(title, (reduced[i, 0], reduced[i, 1]),
                 fontsize=9, alpha=0.8,
                 xytext=(5, 5), textcoords='offset points')

plt.title('Prompt Embeddings Visualization (PCA)')
plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.1%} variance)')
plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.1%} variance)')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('embeddings_visualization.png', dpi=150)
print("Saved to embeddings_visualization.png")
plt.show()

cur.close()
conn.close()
