$ErrorActionPreference='Stop'
$base='http://localhost:8080'
$ts=[int][double]::Parse((Get-Date -UFormat %s))
$email="user$ts@test.com"
$matricule="MAT$ts"
$registerBody=@{email=$email;password='Password123!';password_confirm='Password123!';matricule=$matricule;first_name='Api';last_name='Tester'} | ConvertTo-Json
$reg = Invoke-RestMethod -Method Post -Uri "$base/api/auth/register/" -ContentType 'application/json' -Body $registerBody
$loginBody=@{email=$email;password='Password123!'} | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login/" -ContentType 'application/json' -Body $loginBody
$token = $login.access_token
$userId = $login.user.id
$headers=@{Authorization="Bearer $token"}
Write-Output "REGISTER_OK user_id=$userId"
$courseBody=@{name='Course Front';code="C$ts";description='demo';user_id=$userId;city='City';destination='Dest'} | ConvertTo-Json
$course = Invoke-RestMethod -Method Post -Uri "$base/api/courses/" -Headers $headers -ContentType 'application/json' -Body $courseBody
$courseId = $course.id
Write-Output "COURSE_OK course_id=$courseId"
$b64=[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('hello-course'))
$courseAttachBody=@{file_name='course.txt';content_type='text/plain';content_base64=$b64} | ConvertTo-Json
$courseAttach = Invoke-RestMethod -Method Post -Uri "$base/api/courses/$courseId/attachment/" -Headers $headers -ContentType 'application/json' -Body $courseAttachBody
$courseGet = Invoke-RestMethod -Method Get -Uri "$base/api/courses/$courseId/attachment/" -Headers $headers
Write-Output "COURSE_ATTACHMENT_OK attachment_url=$($courseAttach.attachment_url)"
$congeBody=@{user_id=$userId;type_dabsense='normale';start_date='2026-05-01';end_date='2026-05-03';motif='vacation'} | ConvertTo-Json
$conge = Invoke-RestMethod -Method Post -Uri "$base/api/conges/" -Headers $headers -ContentType 'application/json' -Body $congeBody
$congeId = $conge.id
Write-Output "CONGE_OK conge_id=$congeId"
$congeAttachBody=@{file_name='conge.txt';content_type='text/plain';content_base64=$b64} | ConvertTo-Json
$congeAttach = Invoke-RestMethod -Method Post -Uri "$base/api/conges/$congeId/attachment/" -Headers $headers -ContentType 'application/json' -Body $congeAttachBody
$congeGet = Invoke-RestMethod -Method Get -Uri "$base/api/conges/$congeId/attachment/" -Headers $headers
Write-Output "CONGE_ATTACHMENT_OK attachment_url=$($congeAttach.attachment_url)"
$dtBody=@{course_id=$courseId;courier_id=$userId;start_time='2026-05-01T10:00:00Z';end_time='2026-05-01T12:00:00Z'} | ConvertTo-Json
$dt = Invoke-RestMethod -Method Post -Uri "$base/api/delivered-times/" -Headers $headers -ContentType 'application/json' -Body $dtBody
$dtId = $dt.id
Write-Output "DELIVERED_TIME_OK delivered_time_id=$dtId"
$imgBody=@{file_name='img.txt';content_type='text/plain';content_base64=$b64} | ConvertTo-Json
$imgUp = Invoke-RestMethod -Method Post -Uri "$base/api/delivered-times/$dtId/image/" -Headers $headers -ContentType 'application/json' -Body $imgBody
$imgGet = Invoke-RestMethod -Method Get -Uri "$base/api/delivered-times/$dtId/image/" -Headers $headers
Write-Output "DELIVERED_TIME_IMAGE_OK image_id=$($imgUp.image_id)"
Write-Output 'SMOKE_TEST_SUCCESS'
