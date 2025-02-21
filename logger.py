import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s - %(message)s',
    handlers=[logging.FileHandler('app.log'), logging.StreamHandler()],
)

logger = logging.getLogger('AutodartsMP3Server')

if __name__ == '__main__':
    logger.info('This is an info message')
    logger.warning('This is a warning message')
    logger.error('This is an error message')
