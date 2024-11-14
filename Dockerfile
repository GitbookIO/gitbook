# Use the official Node.js image as the base image
FROM imbios/bun-node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and bun.lockb files to the working directory
COPY . .

# Install the app dependencies
RUN bun install --frozen-lockfile

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Disable telemetry during the build
ENV NEXT_TELEMETRY_DISABLED 1
RUN bun run build

# Expose the port on which the app will run
EXPOSE 3000

# Start the app
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["bun", "run", "start"]