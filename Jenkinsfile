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
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    environment {
        VPS      = '76.13.69.127'
        VPS_PASS = '@@@Fn.2026@@@'
    }

    stages {

        stage('Clonar / Atualizar Código na VPS') {
            steps {
                container('deploy') {
                    sh 'apk add --no-cache openssh-client sshpass curl'
                    sh '''
                        sshpass -p "${VPS_PASS}" ssh -o StrictHostKeyChecking=no root@${VPS} bash -s << 'ENDSSH'
                            set -e
                            if [ -d /opt/bryanvest-frontend/.git ]; then
                                cd /opt/bryanvest-frontend
                                git fetch origin
                                git reset --hard origin/master
                            else
                                git clone https://github.com/agenteinfosoftwareia/bryanvest-frontend.git /opt/bryanvest-frontend
                            fi
                            echo "Codigo atualizado OK"
ENDSSH
                    '''
                }
            }
        }

        stage('Instalar Node.js e Dependencias') {
            steps {
                container('deploy') {
                    sh '''
                        sshpass -p "${VPS_PASS}" ssh -o StrictHostKeyChecking=no root@${VPS} bash -s << 'ENDSSH'
                            set -e
                            if ! command -v node &>/dev/null; then
                                curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
                                apt-get install -y nodejs
                            fi
                            node --version && npm --version
                            cd /opt/bryanvest-frontend
                            npm ci --prefer-offline || npm ci
                            echo "Dependencias OK"
ENDSSH
                    '''
                }
            }
        }

        stage('Build Producao') {
            steps {
                container('deploy') {
                    sh '''
                        sshpass -p "${VPS_PASS}" ssh -o StrictHostKeyChecking=no root@${VPS} bash -s << 'ENDSSH'
                            set -e
                            cd /opt/bryanvest-frontend
                            npm run build
                            echo "Build OK — arquivos em /opt/bryanvest-frontend/dist"
ENDSSH
                    '''
                }
            }
        }

        stage('Publicar Arquivos Estaticos') {
            steps {
                container('deploy') {
                    sh '''
                        sshpass -p "${VPS_PASS}" ssh -o StrictHostKeyChecking=no root@${VPS} bash -s << 'ENDSSH'
                            set -e
                            mkdir -p /var/www/bryanvest
                            cp -r /opt/bryanvest-frontend/dist/. /var/www/bryanvest/
                            chmod -R 755 /var/www/bryanvest
                            echo "Arquivos publicados em /var/www/bryanvest"
ENDSSH
                    '''
                }
            }
        }

        stage('Configurar Nginx e SSL') {
            steps {
                container('deploy') {
                    sh '''
                        sshpass -p "${VPS_PASS}" ssh -o StrictHostKeyChecking=no root@${VPS} bash -s << 'ENDSSH'
                            set -e
                            command -v certbot &>/dev/null || apt-get install -y certbot python3-certbot-nginx

                            CERT=/etc/letsencrypt/live/bryanvest.startupinfosoftware.com.br/fullchain.pem

                            if [ -f "$CERT" ]; then
                                cat > /etc/nginx/sites-available/bryanvest << 'NGINX'
server {
    listen 80;
    server_name bryanvest.startupinfosoftware.com.br;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl;
    server_name bryanvest.startupinfosoftware.com.br;
    ssl_certificate     /etc/letsencrypt/live/bryanvest.startupinfosoftware.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bryanvest.startupinfosoftware.com.br/privkey.pem;
    root /var/www/bryanvest;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX
                            else
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
                                certbot --nginx -d bryanvest.startupinfosoftware.com.br \
                                    --non-interactive --agree-tos -m admin@startupinfosoftware.com.br \
                                    --redirect
                            fi

                            ln -sf /etc/nginx/sites-available/bryanvest /etc/nginx/sites-enabled/bryanvest
                            nginx -t && systemctl reload nginx
                            echo "Nginx + SSL OK"
ENDSSH
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                container('deploy') {
                    sh 'sleep 8 && curl -sfL --max-time 15 https://bryanvest.startupinfosoftware.com.br/ | grep -qi "<!doctype html" && echo "Frontend OK"'
                }
            }
        }

    }

    post {
        success { echo "Deploy #${BUILD_NUMBER} concluido -- https://bryanvest.startupinfosoftware.com.br" }
        failure  { echo "Deploy #${BUILD_NUMBER} falhou -- verifique os logs acima" }
    }
}
