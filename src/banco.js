
const NOME_BANCO = 'CineNeonDB'
const NOME_LOJA = 'midias'

export function abrirBanco() {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(NOME_BANCO, 1)

    pedido.onupgradeneeded = () => {
      const banco = pedido.result

      if (!banco.objectStoreNames.contains(NOME_LOJA)) {
        banco.createObjectStore(NOME_LOJA, {
          keyPath: 'id'
        })
      }
    }

    pedido.onsuccess = () => resolve(pedido.result)
    pedido.onerror = () => reject(pedido.error)
  })
}

export async function salvarMidia(midia) {
  const banco = await abrirBanco()

  return new Promise((resolve, reject) => {
    const transacao = banco.transaction(NOME_LOJA, 'readwrite')

    transacao.objectStore(NOME_LOJA).put(midia)

    transacao.oncomplete = () => {
      banco.close()
      resolve()
    }

    transacao.onerror = () => {
      banco.close()
      reject(transacao.error)
    }
  })
}

export async function listarMidias() {
  const banco = await abrirBanco()

  return new Promise((resolve, reject) => {
    const transacao = banco.transaction(NOME_LOJA, 'readonly')
    const pedido = transacao.objectStore(NOME_LOJA).getAll()

    transacao.oncomplete = () => {
      banco.close()
      resolve(pedido.result)
    }

    transacao.onerror = () => {
      banco.close()
      reject(transacao.error)
    }
  })
}

export async function removerMidia(id) {
  const banco = await abrirBanco()

  return new Promise((resolve, reject) => {
    const transacao = banco.transaction(NOME_LOJA, 'readwrite')

    transacao.objectStore(NOME_LOJA).delete(id)

    transacao.oncomplete = () => {
      banco.close()
      resolve()
    }

    transacao.onerror = () => {
      banco.close()
      reject(transacao.error)
    }
  })
}

