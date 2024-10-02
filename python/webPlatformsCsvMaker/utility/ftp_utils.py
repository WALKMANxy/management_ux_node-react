# utility/ftp_utils.py

from ftplib import FTP
import os

def upload_to_ftp(file_path, ftp_info):
    try:
        ftp = FTP(ftp_info['host'])
        ftp.login(ftp_info['user'], ftp_info['pass'])
        ftp.cwd(ftp_info['dir'])
        with open(file_path, 'rb') as file:
            ftp.storbinary(f'STOR {os.path.basename(file_path)}', file)
        ftp.quit()
        return True, None  # Return success and no error
    except Exception as e:
        return False, str(e)  # Return failure and the error message
