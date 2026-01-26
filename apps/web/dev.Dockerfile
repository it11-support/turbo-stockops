FROM node:lts

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy lockfile dan package.json terlebih dahulu agar Docker layer caching bekerja
COPY package.json ./

# Install dependencies menggunakan pnpm
RUN pnpm install

# Copy sisa source code
COPY . .

# Expose port yang digunakan oleh Vite
EXPOSE 5173

# Set environment agar bisa diakses dari luar container
ENV HOST=0.0.0.0
ENV PORT=5173

# Jalankan dev server
CMD ["pnpm", "dev", "--host"]
