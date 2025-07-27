import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as bodyParser from 'body-parser'
import * as compression from 'compression'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    const options = {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true
    }

    // Increase request body size limit (default: 100kb)
    app.use(bodyParser.json({ limit: '10mb' })) // Set the limit as per needs
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
    app.enableCors(options)
    app.use(helmet())
    app.use(compression())
    app.enableVersioning({
        type: VersioningType.URI
    })
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true
        })
    )
    await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
