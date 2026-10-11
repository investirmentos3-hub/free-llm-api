#!/bin/bash

# Script para fazer backup de produção

echo "🔄 Iniciando backup de produção..."

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar pasta de backups
mkdir -p $BACKUP_DIR

# Fazer backup do banco de dados
echo "💾 Backup do banco de dados..."
sudo docker exec backend cp /app/data/app.db /app/data/app_${DATE}.db.backup
sudo cp backend/data/app.db $BACKUP_DIR/app_${DATE}.db

# Fazer backup das conversas
echo "💬 Backup das conversas..."
sudo tar -czf $BACKUP_DIR/conversations_${DATE}.tar.gz backend/data/

# Fazer backup do código
echo "📝 Backup do código..."
git archive --format zip --output $BACKUP_DIR/source_${DATE}.zip HEAD

# Listar backups
echo ""
echo "✅ Backup concluído!"
echo ""
echo "Arquivos criados:"
ls -lh $BACKUP_DIR | tail -5

echo ""
echo "💡 Para restaurar:"
echo "   cp $BACKUP_DIR/app_${DATE}.db backend/data/app.db"
echo "   docker-compose restart backend"
