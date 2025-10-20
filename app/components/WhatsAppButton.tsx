"use client"

export default function WhatsAppButton() {
  const phoneNumber = "6287782446000" // ganti dengan nomor admin (format internasional)
  const message = encodeURIComponent("Halo! Saya mau tanya soal peminjaman/fasilitas.")
  const link = `https://wa.me/${phoneNumber}?text=${message}`

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110"
      title="Hubungi via WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.868-2.03-.967-.273-.099-.472-.149-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.173.198-.297.297-.496.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.205-.242-.579-.487-.5-.67-.51-.173-.009-.372-.011-.571-.011-.198 0-.52.074-.793.372-.273.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.098 3.209 5.085 4.499.711.306 1.264.489 1.696.625.712.227 1.36.195 1.872.118.571-.085 1.758-.718 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.273-.198-.57-.347zM12.005 2C6.477 2 2 6.477 2 12.005c0 2.116.693 4.068 1.864 5.67L2 22l4.427-1.833a9.955 9.955 0 0 0 5.578 1.671h.005c5.528 0 10.005-4.477 10.005-10.005S17.533 2 12.005 2z" />
      </svg>
    </a>
  )
}
