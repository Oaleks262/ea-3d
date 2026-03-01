# VPS Deployment Guide

## Server Requirements

- Ubuntu 20.04+ / Debian 11+
- Node.js 18+
- Nginx
- PM2
- 2GB RAM minimum

## Quick Deployment Commands

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install Nginx and PM2
sudo apt install -y nginx
sudo npm install -g pm2

# 4. Clone repository
cd /var/www
sudo git clone https://github.com/Oaleks262/ea-3d.git
sudo chown -R $USER:$USER ea-3d
cd ea-3d

# 5. Install dependencies (must be done on VPS so native modules compile for Linux)
cd server && npm install
cd ../client && npm install
cd ..

# 6. Create .env file
cd server
nano .env
# Copy contents from .env.example and configure
cd ..

# 7. Build frontend
cd client && npm run build
cd ..

# 8. Start with PM2 (runs only the server; server serves built client as static files)
cd server
pm2 start node --name "ea-portfolio" -- index.js
pm2 save
pm2 startup
cd ..

# 9. Configure Nginx
sudo nano /etc/nginx/sites-available/ea-portfolio
```

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:612;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ea-portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## Environment Variables (.env)

```env
PORT=612
NODE_ENV=production
ADMIN_EMAIL=admin@elizaveta.com
ADMIN_PASSWORD_HASH=your_bcrypt_hash
JWT_SECRET=your_random_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Useful PM2 Commands

```bash
pm2 list                 # Show all processes
pm2 logs ea-portfolio    # View logs
pm2 restart ea-portfolio # Restart app
pm2 stop ea-portfolio    # Stop app
pm2 delete ea-portfolio  # Remove from PM2
```

## Update Deployment

```bash
cd /var/www/ea-3d
git pull origin main
cd server && npm install && cd ..
cd client && npm install && npm run build && cd ..
pm2 restart ea-portfolio
```

## Firewall Setup

```bash
sudo ufw allow 22       # SSH
sudo ufw allow 80       # HTTP
sudo ufw allow 443      # HTTPS
sudo ufw enable
```
