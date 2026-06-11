pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: deploy
    image: alpine/git:latest
    imagePullPolicy: IfNotPresent
    command: ["sleep", "infinity"]
'''
        }
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    environment {
        VPS      = '76.13.69.127'
        VPS_PASS = '@@@Fn.2026@@@'
        APP_PATH = '/opt/bryanvest-frontend'
        WWW_PATH = '/var/www/bryanvest'
        DOMAIN   = 'bryanvest.startupinfosoftware.com.br'
        GH_REPO  = 'https://github.com/agenteinfosoftwareia/bryanvest-frontend.git'
    }

    stages {

        stage('Clonar / Atualizar Código na VPS') {
            steps {
                container('deploy') {
                    sh 'apk add --no-cache openssh-client sshpass curl'
                    sh '''
                        sshpass -p "${VPS_PASS}" ssh -o StrictHostKeyChecking=no root@${VPS} bash -s << 'ENDSSH'
                            set -e
                            if [ -d ${APP_PATH}/.git ]; then
                                cd ${APP_PATH}
                                git fetch origin
                                git reset --hard origin/master
                            else
                                git clone ${GH_REPO} ${APP_PATH}
                            fi
                            echo "Codigo atualizado OK"
ENDSSH
                    '''
                }
            }
        }

        stage('Instalar Node.js e Dependências') {
            steps {
                container('deploy') {
                    sh '''
                        sshpass -p "${VPS_PASS}" ssh -o StrictHostKeyChecking=no root@${VPS} bash -s << 'ENDSSH'
                            set -e
                            # Instala Node.js 20 LTS se não estiver presente
                            if ! command -v node &>/dev/null; then
                                curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
                                apt-get install -y nodejs
                            fi
                            node --version && npm --version
                            cd ${APP_PATH}
                            npm ci --prefer-offline || npm ci
                            echo "Dependencias OK"
ENDSSH
                    '''
                }
            }
        }

        stage('Build Produção') {
            steps {
                container('deploy') {
                    sh '''
                        sshpass -p "${VPS_PASS}" ssh -o StrictHostKeyChecking=no root@${VPS} bash -s << 'ENDSSH'
                            set -e
                            cd ${APP_PATH}
                            npm run build
                            echo "Build OK"
ENDSSH
                    '''
                }
            }
        }

        stage('Publicar Arquivos Estáticos') {
            steps {
                container('deploy') {
                    sh '''
                        sshpass -p "${VPS_PASS}" ssh -o StrictHostKeyChecking=no root@${VPS} bash -s << 'ENDSSH'
                            set -e
                            mkdir -p ${WWW_PATH}
                            cp -r ${APP_PATH}/dist/. ${WWW_PATH}/
                            chmod -R 755 ${WWW_PATH}
                            echo "Arquivos publicados em ${WWW_PATH}"
ENDSSH
                    '''
                }
            }
        }

        stage('Configurar Nginx + SSL') {
            steps {
                container('deploy') {
                    sh '''
                        sshpass -p "${VPS_PASS}" ssh -o StrictHostKeyChecking=no root@${VPS} bash -s << 'ENDSSH'
                            set -e

                            # Garante que certbot está instalado
                            command -v certbot &>/dev/null || apt-get install -y certbot python3-certbot-nginx

                            # Cria config HTTP inicial (para certbot validar)
                            cat > /etc/nginx/sites-available/bryanvest << 'NGINX'
server {
    listen 80;
    server_name bryanvest.startupinfosoftware.com.br;

    root /var/www/bryanvest;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX
                            ln -sf /etc/nginx/sites-available/bryanvest /etc/nginx/sites-enabled/bryanvest
                            nginx -t && systemctl reload nginx

                            # Emite/renova certificado SSL
                            CERT_PATH="/etc/letsencrypt/live/bryanvest.startupinfosoftware.com.br/fullchain.pem"
                            if [ ! -f "$CERT_PATH" ]; then
                                certbot --nginx -d bryanvest.startupinfosoftware.com.br \
                                    --non-interactive --agree-tos -m admin@startupinfosoftware.com.br \
                                    --redirect
                            else
                                certbot renew --quiet
                                nginx -t && systemctl reload nginx
                            fi

                            echo "Nginx + SSL OK"
ENDSSH
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                container('deploy') {
                    sh 'sleep 10 && curl -sfL --max-time 10 https://${DOMAIN}/ | grep -q "<!doctype html>" && echo "Frontend OK"'
                }
            }
        }

    }

    post {
        success { echo "Deploy #${BUILD_NUMBER} concluido -- https://${DOMAIN}" }
        failure  { echo "Deploy #${BUILD_NUMBER} falhou -- verifique os logs acima" }
    }
}
