Add-Type -AssemblyName System.Drawing
$inputFile = "c:\Users\ADMIN\Downloads\My Amma's Kitchen\My Amma's Kitchen\user\src\assets\img\logo.jpeg"
$outputUser = "c:\Users\ADMIN\Downloads\My Amma's Kitchen\My Amma's Kitchen\user\src\assets\img\logo.png"
$outputAdmin = "c:\Users\ADMIN\Downloads\My Amma's Kitchen\My Amma's Kitchen\admin\src\assets\img\logo.png"

$img = [System.Drawing.Bitmap]::FromFile($inputFile)
$bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0)
$g.Dispose()
$img.Dispose()

for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $p = $bmp.GetPixel($x, $y)
        $m = [Math]::Min($p.R, [Math]::Min($p.G, $p.B))
        
        if ($m -ge 245) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        } else {
            # Advanced alpha un-premultiplication
            $alpha = 255 - $m
            
            $r = [Math]::Max(0, [Math]::Min(255, [int]((($p.R - $m) * 255) / $alpha)))
            $g = [Math]::Max(0, [Math]::Min(255, [int]((($p.G - $m) * 255) / $alpha)))
            $b = [Math]::Max(0, [Math]::Min(255, [int]((($p.B - $m) * 255) / $alpha)))
            
            $newColor = [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b)
            $bmp.SetPixel($x, $y, $newColor)
        }
    }
}

$bmp.Save($outputUser, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outputAdmin, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Processed images with advanced anti-aliasing."
