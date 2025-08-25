import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as bodyParser from 'body-parser'
import * as compression from 'compression'
import helmet from 'helmet'
import * as morgan from 'morgan'
import { AppModule } from './app.module'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    const options = {
        origin: [
            'http://localhost:3000',
            'https://dev-web.pullsight.ai',
            'https://pullsight.ai',
            'https://stage-web.pullsight.ai'
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true
    }

    app.use(morgan('tiny'))

    // Increase request body size limit (default: 100kb)
    app.use(bodyParser.json({ limit: '10mb' })) // Set the limit as per needs
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
    app.enableCors(options)
    //app.enableCors()
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
