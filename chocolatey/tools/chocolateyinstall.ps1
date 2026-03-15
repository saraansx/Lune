$ErrorActionPreference = 'Stop';

$packageName = 'lune'
$toolsDir   = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"
$url64      = 'https://github.com/saraansx/Lune/releases/download/v1.0.2/Lune-Setup-1.0.2.exe'
$checksum64 = 'F7A6D7B9DD620FF27A03C1B2062CE046181AE6493100A7EA4ED90C81B76B71FC'

$packageArgs = @{
  packageName   = $packageName
  unzipLocation = $toolsDir
  fileType      = 'exe'
  url64bit      = $url64
  checksum64    = $checksum64
  checksumType64= 'sha256'
  silentArgs    = '/S'
  validExitCodes= @(0, 1641, 3010, 2147942400)
}

Install-ChocolateyPackage @packageArgs
