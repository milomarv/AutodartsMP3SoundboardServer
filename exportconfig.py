import os
from pydantic import BaseModel
from logger import logger

empty_config = {'info': ''}

EXPORT_DIRECTORY = 'export'


class Info(BaseModel):
    info: str

    def __str__(name) -> str:
        output_str = f'Put MP3 for {name} in this folder\n'
        output_str += 'ONLY ONE MP3 FILE ALLOWED!'
        return output_str


class WinnerInfo(Info):
    name: str


class InfoList(BaseModel):
    value: list[Info]

    def __str__(name) -> str:
        return f'Put MP3 for {name} in this folder'


class WinnerInfoList(InfoList):
    value: list[WinnerInfo]

    def __str__(name) -> str:
        output_str = f'Put MP3 for {name} in this folder\n'
        output_str += 'Format: <player_name>_<audio_file_name>.mp3'
        return output_str


class ExportConfig(BaseModel):
    T: Info = empty_config
    T15: Info = empty_config
    T16: Info = empty_config
    T17: Info = empty_config
    T18: Info = empty_config
    T19: Info = empty_config
    T20: Info = empty_config
    bot: Info = empty_config
    botOutside: Info = empty_config  # noqa: N815
    bull: Info = empty_config
    bust: Info = empty_config
    cricketHit: Info = empty_config  # noqa: N815
    cricketMiss: Info = empty_config  # noqa: N815
    gameOn: Info = empty_config  # noqa: N815
    playerStart: Info = empty_config  # noqa: N815
    miss: InfoList = []
    winner: WinnerInfoList = []
    winnerSoundOnLegWin: bool = True  # noqa: N815


class ExportConfigTools:
    def __init__(self, input_dir: str, output_dir: str, serving_url: str) -> None:
        self.input_dir = input_dir
        self.output_dir = output_dir
        self.serving_url = serving_url
        self.input_export_dir = os.path.join(self.input_dir, EXPORT_DIRECTORY)
        self.output_export_dir = os.path.join(self.output_dir, EXPORT_DIRECTORY)

    def generate_export_config_folder_structure(self) -> None:
        logger.info('Generating Export file structure...')
        for dir in [self.input_export_dir, self.output_export_dir]:
            if not os.path.exists(dir):
                os.makedirs(dir)

            for key, info in ExportConfig.model_fields.items():
                if info.annotation == bool:
                    continue

                if not os.path.exists(os.path.join(dir, key)):
                    os.makedirs(os.path.join(dir, key))
                else:
                    for f in os.listdir(os.path.join(dir, key)):
                        if f.endswith('.txt'):
                            os.remove(os.path.join(dir, key, f))

                with open(os.path.join(dir, key, f'_{key}_details.txt'), 'w') as f:
                    f.write(info.annotation.__str__(key))

    def build_export_json(self) -> dict:
        logger.info('Building Export JSON...')
        export_config = ExportConfig()
        for key, info in ExportConfig.model_fields.items():
            if info.annotation == bool:
                continue

            folder_files = os.listdir(os.path.join(self.output_export_dir, key))
            folder_files = [f for f in folder_files if f.endswith('.mp3')]
            folder_urls = [os.path.join(EXPORT_DIRECTORY, key, f) for f in folder_files]
            folder_urls = [f.replace('\\', '/') for f in folder_urls]
            folder_urls = [f'{self.serving_url}/{f}' for f in folder_urls]

            if info.annotation == Info:
                if len(folder_files):
                    setattr(export_config, key, Info(info=folder_urls[0]))
                else:
                    setattr(export_config, key, Info(info=''))
            elif info.annotation == InfoList:
                if len(folder_files):
                    setattr(
                        export_config,
                        key,
                        InfoList(value=[Info(info=f) for f in folder_urls]),
                    )
                else:
                    setattr(export_config, key, InfoList(value=[]))
            elif info.annotation == WinnerInfoList:
                if len(folder_files):
                    info_list = [
                        WinnerInfo(name=f.split('_')[0], info=u)
                        for f, u in zip(folder_files, folder_urls)
                    ]
                    setattr(export_config, key, WinnerInfoList(value=info_list))
                else:
                    setattr(export_config, key, WinnerInfoList(value=[]))

        export_json = export_config.model_dump()
        for key, info in export_config.model_fields.items():
            if info.annotation in (InfoList, WinnerInfoList):
                export_json[key] = export_json[key]['value']

        logger.info('Save JSON locally')
        with open(os.path.join(self.output_export_dir, 'export.json'), 'w') as f:
            f.write(export_json.json())

        return export_json
